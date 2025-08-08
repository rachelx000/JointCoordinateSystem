import { useRef, useEffect } from "react";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import "../css/GeometryVis.css"
import {
    initializeRender,
    generate4DMesh,
    make4DRotationMatrix,
    update4DRotation,
} from "./GeometryVis.js";
import * as THREE from 'three';

export default function GeometryVis({ data, nowPolygonData, geomMode, meshRenderingReady, setMeshRenderingReady,
                                      inspectedIndex }) {
    let params = useRef({
        animate: { rotateXY: false, rotateXZ: false, rotateYZ: false, rotateXW: false, rotateYW: false, rotateZW: false },
        rotation: { angleXY: 0, angleXZ: 0, angleYZ: 0, angleXW: 0, angleYW: 0, angleZW: 0 }
    });
    const renderRef = useRef(null);
    const sceneRef = useRef(null);
    const meshRef = useRef(null);
    const guiRef = useRef(null);
    const guiContainerRef = useRef(null);
    const indicatorRef = useRef(null);
    const inspectedIndexRef = useRef(null);

    // Initialize the rendering engine once
    useEffect(() => {
        const [ scene, camera, renderer, controls, labels ] = initializeRender(renderRef.current);

        let gui = new GUI({ autoPlace: false });
        let angleXYControl = gui.add( params.current.rotation, 'angleXY', 0, 2*Math.PI).name("RotateXY (Rotate Z)");
        gui.add( params.current.animate, 'rotateXY').name("OnRotateXY");
        let angleXZControl = gui.add( params.current.rotation, 'angleXZ', 0, 2*Math.PI).name("RotateXZ (Rotate Y)");
        gui.add( params.current.animate, 'rotateXZ').name("OnRotateXZ");
        let angleYZControl = gui.add( params.current.rotation, 'angleYZ', 0, 2*Math.PI).name("RotateYZ (Rotate X)");
        gui.add( params.current.animate, 'rotateYZ').name("OnRotateYZ");
        let angleXWControl = gui.add( params.current.rotation, 'angleXW', 0, 2*Math.PI).name("RotateXW");
        gui.add( params.current.animate, 'rotateXW').name("OnRotateXW");
        let angleYWControl = gui.add( params.current.rotation, 'angleYW', 0, 2*Math.PI).name("RotateYW");
        gui.add( params.current.animate, 'rotateYW').name("OnRotateYW");
        let angleZWControl = gui.add( params.current.rotation, 'angleZW', 0, 2*Math.PI).name("RotateZW");
        gui.add( params.current.animate, 'rotateZW').name("OnRotateZW");


        function animate() {
            requestAnimationFrame(animate);

            if ( meshRef.current ) {
                if ( params.current.animate.rotateXY ) {
                    params.current.rotation.angleXY += 0.008;
                    params.current.rotation.angleXY %= 2 * Math.PI;
                    angleXYControl.updateDisplay();
                }
                if ( params.current.animate.rotateXZ ) {
                    params.current.rotation.angleXZ += 0.008;
                    params.current.rotation.angleXZ %= 2 * Math.PI;
                    angleXZControl.updateDisplay();
                }
                if ( params.current.animate.rotateYZ ) {
                    params.current.rotation.angleYZ += 0.008;
                    params.current.rotation.angleYZ %= 2 * Math.PI;
                    angleYZControl.updateDisplay();
                }
                if ( params.current.animate.rotateXW ) {
                    params.current.rotation.angleXW += 0.008;
                    params.current.rotation.angleXW %= 2 * Math.PI;
                    angleXWControl.updateDisplay();
                }
                if ( params.current.animate.rotateYW ) {
                    params.current.rotation.angleYW += 0.008;
                    params.current.rotation.angleYW %= 2 * Math.PI;
                    angleYWControl.updateDisplay();
                }
                if ( params.current.animate.rotateZW ) {
                    params.current.rotation.angleZW += 0.008;
                    params.current.rotation.angleZW %= 2 * Math.PI;
                    angleZWControl.updateDisplay();
                }

                let rotation_matrix = make4DRotationMatrix(params.current.rotation);
                update4DRotation(meshRef.current, indicatorRef, inspectedIndexRef.current, rotation_matrix);
            }

            controls.update();
            renderer.render(scene, camera);
            labels.forEach(label_mesh => label_mesh.lookAt(camera.position));
        }

        sceneRef.current = scene;
        guiRef.current = gui;
        guiContainerRef.current.appendChild(guiRef.current.domElement);
        animate();

        return () => {
            renderer.dispose();
            if (guiRef.current) {
                guiRef.current.destroy();
                guiRef.current = null;
            }
        };
    }, []);


    useEffect(() => {
        if (sceneRef.current !== null && nowPolygonData !== null
             && meshRenderingReady) {
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
            meshRef.current = generate4DMesh( geomMode, data, nowPolygonData );
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
            indicatorRef.current = null;
        }
        if (meshRef !== null && inspectedIndex !== null) {
            inspectedIndexRef.current = inspectedIndex;
            let positions = meshRef.current.mesh.geometry.attributes.position;
            let inspected_p = new THREE.Vector3(
                positions.getX(inspectedIndex),
                positions.getY(inspectedIndex),
                positions.getZ(inspectedIndex)
            );
            let indicator_geometry = new THREE.SphereGeometry(0.1, 16, 16);
            let indicator_material = new THREE.MeshStandardMaterial({
                color: nowPolygonData[inspectedIndex].color,
                opacity: 1.0,
                emissive: 0xffffff,
                emissiveIntensity: 0.5
            });
            let indicator = new THREE.Mesh(indicator_geometry, indicator_material);
            indicator.position.copy(inspected_p);

            indicatorRef.current = indicator;
            sceneRef.current.add(indicator);
        }

        return () => {
            if (indicatorRef.current) {
                sceneRef.current.remove(indicatorRef.current);
                indicatorRef.current.geometry.dispose();
                indicatorRef.current.material.dispose();
                indicatorRef.current = null;
            }
        }
    }, [inspectedIndex])

    return (
        <div id="geometry-vis">
            <h3>Parametric Surface Rendering</h3>
            <div id="geometry-vis-container" ref={renderRef}></div>
            <div id="geometry-vis-gui-container" ref={guiContainerRef}></div>
        </div>
    );
}