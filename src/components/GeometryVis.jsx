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

export default function GeometryVis({ nowPolygonData, geomMode, meshRenderingReady, setMeshRenderingReady }) {
    const renderRef = useRef(null);
    const sceneRef = useRef(null);
    const meshRef = useRef(null);

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
            && nowPolygonData.length === 561 && meshRenderingReady) {
            // Remove old mesh from the scene
            if (meshRef.current) {
                sceneRef.current.remove(meshRef.current);
                meshRef.current.geometry.dispose();
                meshRef.current.material.dispose();
            }

            // Create new mesh and add to the scene
            let mesh, paramFunction;
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
            mesh = generateParamSurfaceMesh( paramFunction, nowPolygonData );

            meshRef.current = mesh;
            sceneRef.current.add(mesh);
            setMeshRenderingReady(false);
        }
    }, [meshRenderingReady, nowPolygonData, geomMode]);

    return (
        <div id="geometry-vis">
            <h3>Parametric Surface Rendering</h3>
            <div id="geometry-vis-container" ref={renderRef}>
            </div>
        </div>
    );
}