import { useRef, useEffect } from "react";
import "../css/GeometryVis.css"
import {
    initializeRender, generateParamSurfaceMesh,
    coneParamFunction, helixParamFunction, torusParamFunction
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
        if (sceneRef.current !== null && nowPolygonData !== null && meshRenderingReady) {
            // Remove old mesh from the scene
            if (meshRef.current) {
                sceneRef.current.remove(meshRef.current);
                meshRef.current.geometry.dispose();
                meshRef.current.material.dispose();
            }

            // Create new mesh and add to the scene
            let mesh;
            switch (geomMode) {
                case "cone":
                    mesh = generateParamSurfaceMesh( coneParamFunction, nowPolygonData );
                    break;
                case "helix":
                    mesh = generateParamSurfaceMesh( helixParamFunction, nowPolygonData );
                    break;
                case "torus":
                    mesh = generateParamSurfaceMesh( torusParamFunction, nowPolygonData );
                    break;
            }
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