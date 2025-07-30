import { useRef, useEffect } from "react";
import "../css/GeometryVis.css"
import {
    initializeRender,
    generateParamSurfaceMesh,
    cylinderParamFunction,
    coneParamFunction,
    helixParamFunction,
    torusParamFunction,
    ellipticParaParamFunction,
    hyperbolicParaParamFunction
} from "./GeometryVis.js";
import * as THREE from 'three';

export default function GeometryVis({ nowPolygonData, geomMode, meshRenderingReady, setMeshRenderingReady,
                                      inspectedIndex }) {
    const renderRef = useRef(null);
    const sceneRef = useRef(null);
    const meshRef = useRef(null);
    const indicatorRef = useRef(null);

    // Initialize the rendering engine once
    useEffect(() => {
        const [ scene, camera, renderer, controls, animate ] = initializeRender(renderRef.current);
        sceneRef.current = scene;
        animate();

        return () => {
            renderer.dispose();
        };
    }, []);


    useEffect(() => {
        if (sceneRef.current !== null && nowPolygonData !== null
            && nowPolygonData.length === 121 && meshRenderingReady) {
            // Remove old mesh from the scene
            if (meshRef.current) {
                sceneRef.current.remove(meshRef.current.mesh);
                sceneRef.current.remove(meshRef.current.wireframe);
                meshRef.current.mesh.geometry.dispose();
                meshRef.current.mesh.material.dispose();
                meshRef.current.wireframe.geometry.dispose();
                meshRef.current.wireframe.material.dispose();
            }

            // Create new mesh and add to the scene
            let paramFunction;
            switch (geomMode) {
                case "cylinder":
                    paramFunction = cylinderParamFunction;
                    break;
                case "cone":
                    paramFunction = coneParamFunction;
                    break;
                case "helix":
                    paramFunction = helixParamFunction;
                    break;
                case "torus":
                    paramFunction = torusParamFunction;
                    break;
                case "ellipticPara":
                    paramFunction = ellipticParaParamFunction;
                    break;
                case "hyperbolicPara":
                    paramFunction = hyperbolicParaParamFunction;
                    break;
                default:
                    throw Error("No valid parametric function is found!");
            }

            meshRef.current = generateParamSurfaceMesh( paramFunction, nowPolygonData );
            sceneRef.current.add(meshRef.current.mesh);
            sceneRef.current.add(meshRef.current.wireframe);
            setMeshRenderingReady(false);
        }
    }, [meshRenderingReady, nowPolygonData, geomMode]);

    useEffect(() => {
        if (sceneRef !== null && indicatorRef.current !== null) {
            sceneRef.current.remove(indicatorRef.current);
            indicatorRef.current.geometry.dispose();
            indicatorRef.current.material.dispose();
        }
        if (meshRef !== null && inspectedIndex !== null) {
            let positions = meshRef.current.mesh.geometry.attributes.position;
            let inspected_p = new THREE.Vector3(
                positions.getX(inspectedIndex),
                positions.getY(inspectedIndex),
                positions.getZ(inspectedIndex)
            );
            let indicator_geometry = new THREE.SphereGeometry(0.08, 16, 16);
            let indicator_material = new THREE.MeshStandardMaterial({
                color: nowPolygonData[inspectedIndex].color,
                emissive: 0xffffff,
                emissiveIntensity: 0.1
            });
            let indicator = new THREE.Mesh(indicator_geometry, indicator_material);
            indicator.position.copy(inspected_p);

            indicatorRef.current = indicator;
            sceneRef.current.add(indicator);
        }
    }, [inspectedIndex])

    return (
        <div id="geometry-vis">
            <h3>Parametric Surface Rendering</h3>
            <div id="geometry-vis-container" ref={renderRef}>
            </div>
        </div>
    );
}