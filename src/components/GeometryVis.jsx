import { useRef, useEffect } from "react";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import "../css/GeometryVis.css"
import {
    initializeRender,
    generateMesh,
    update3DRotation,
    make4DRotationMatrix,
    update4DRotation,
} from "./GeometryVis.js";
import * as THREE from 'three';

export default function GeometryVis({ data, nowPolygonData, geomMode, meshRenderReady, inspectedIndex }) {
    let params4D = useRef({
        animate: { rotateXY: false, rotateXZ: false, rotateYZ: false, rotateXW: false, rotateYW: false, rotateZW: false },
        rotation: { angleXY: 0, angleXZ: 0, angleYZ: 0, angleXW: 0, angleYW: 0, angleZW: 0 },
        show3DAxis: true
    });
    let params3D = useRef({
        animate: { rotateX: false, rotateY: false, rotateZ: false },
        rotation: { angleX: 0, angleY: 0, angleZ: 0 },
        show3DAxis: true
    });

    const geomModeRef = useRef({id: null, mode: null});
    const renderRef = useRef(null);
    const sceneRef = useRef(null);
    const meshRef = useRef(null);
    const guiRef = useRef(null);
    const guiControlsRef = useRef({});
    const guiContainerRef = useRef(null);
    const indicatorRef = useRef(null);
    const inspectedIndexRef = useRef(null);
    const axesRef = useRef(null);
    const axesLabelRef = useRef(null);

    // Initialize the rendering engine once
    useEffect(() => {
        const [ scene, camera, renderer, controls, labels, axes ] = initializeRender(renderRef.current);

        function animate() {
            requestAnimationFrame(animate);

            if ( meshRef.current ) {
                if ( geomModeRef.current.mode === "3D" ) {
                    if (params3D.current.animate.rotateX) {
                        params3D.current.rotation.angleX += 0.008;
                        params3D.current.rotation.angleX %= 2 * Math.PI;
                        guiControlsRef.current.angleX?.updateDisplay();
                    }
                    if (params3D.current.animate.rotateY) {
                        params3D.current.rotation.angleY += 0.008;
                        params3D.current.rotation.angleY %= 2 * Math.PI;
                        guiControlsRef.current.angleY?.updateDisplay();
                    }
                    if (params3D.current.animate.rotateZ) {
                        params3D.current.rotation.angleZ += 0.008;
                        params3D.current.rotation.angleZ %= 2 * Math.PI;
                        guiControlsRef.current.angleZ?.updateDisplay();
                    }

                    update3DRotation(params3D.current.rotation, meshRef.current, indicatorRef, inspectedIndexRef.current);
                }
                if ( geomModeRef.current.mode === "4D" ) {
                    if (params4D.current.animate.rotateXY) {
                        params4D.current.rotation.angleXY += 0.008;
                        params4D.current.rotation.angleXY %= 2 * Math.PI;
                        guiControlsRef.current.angleXY?.updateDisplay();
                    }
                    if (params4D.current.animate.rotateXZ) {
                        params4D.current.rotation.angleXZ += 0.008;
                        params4D.current.rotation.angleXZ %= 2 * Math.PI;
                        guiControlsRef.current.angleXZ?.updateDisplay();
                    }
                    if (params4D.current.animate.rotateYZ) {
                        params4D.current.rotation.angleYZ += 0.008;
                        params4D.current.rotation.angleYZ %= 2 * Math.PI;
                        guiControlsRef.current.angleYZ?.updateDisplay();
                    }
                    if (params4D.current.animate.rotateXW) {
                        params4D.current.rotation.angleXW += 0.008;
                        params4D.current.rotation.angleXW %= 2 * Math.PI;
                        guiControlsRef.current.angleXW?.updateDisplay();
                    }
                    if (params4D.current.animate.rotateYW) {
                        params4D.current.rotation.angleYW += 0.008;
                        params4D.current.rotation.angleYW %= 2 * Math.PI;
                        guiControlsRef.current.angleYW?.updateDisplay();
                    }
                    if (params4D.current.animate.rotateZW) {
                        params4D.current.rotation.angleZW += 0.008;
                        params4D.current.rotation.angleZW %= 2 * Math.PI;
                        guiControlsRef.current.angleZW?.updateDisplay();
                    }

                    let rotation_matrix = make4DRotationMatrix(params4D.current.rotation);
                    update4DRotation(meshRef.current, indicatorRef, inspectedIndexRef.current, rotation_matrix);
                }
            }

            controls.update();
            renderer.render(scene, camera);
            labels.children.forEach(label_mesh => label_mesh.lookAt(camera.position));
        }

        sceneRef.current = scene;
        axesRef.current = axes;
        axesLabelRef.current = labels;
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
        if (!sceneRef.current)
            return;

        // Remove old mesh from the scene
        if (meshRef.current) {
            sceneRef.current.remove(meshRef.current.mesh);
            sceneRef.current.remove(meshRef.current.wireframe);
            meshRef.current.mesh.geometry.dispose();
            meshRef.current.mesh.material.dispose();
            meshRef.current.wireframe.geometry.dispose();
            meshRef.current.wireframe.material.dispose();
            meshRef.current = null;
        }

        geomModeRef.current = geomMode;
        if (guiRef.current) {
            guiRef.current.destroy();
            guiRef.current = null;
        }

        let gui = new GUI({ autoPlace: false });
        if (geomModeRef.current.mode === "3D") {
            // Reset the states of params
            Object.keys(params3D.current.animate).forEach(key => {
                params3D.current.animate[key] = false;
            })
            Object.keys(params3D.current.rotation).forEach(key => {
                params3D.current.rotation[key] = 0;
            })

            guiControlsRef.current.angleX = gui.add(params3D.current.rotation, 'angleX', 0, 2 * Math.PI).name("RotateX");
            gui.add(params3D.current.animate, 'rotateX').name("OnRotateX");
            guiControlsRef.current.angleY = gui.add(params3D.current.rotation, 'angleY', 0, 2 * Math.PI).name("RotateY");
            gui.add(params3D.current.animate, 'rotateY').name("OnRotateY");
            guiControlsRef.current.angleZ = gui.add(params3D.current.rotation, 'angleZ', 0, 2 * Math.PI).name("RotateZ");
            gui.add(params3D.current.animate, 'rotateZ').name("OnRotateZ");
            gui.add(params3D.current, "show3DAxis").name("Show 3D Axes")
                .onChange((value) => {
                    if (axesRef.current) {
                        axesRef.current.visible = value;
                    }
                    if (axesLabelRef.current) {
                        axesLabelRef.current.visible = value;
                    }
                });
        }
        if (geomModeRef.current.mode === "4D") {
            Object.keys(params4D.current.animate).forEach(key => {
                params4D.current.animate[key] = false;
            })
            Object.keys(params4D.current.rotation).forEach(key => {
                params4D.current.rotation[key] = 0;
            })

            guiControlsRef.current.angleXY = gui.add(params4D.current.rotation, 'angleXY', 0, 2 * Math.PI).name("RotateXY (Rotate Z)");
            gui.add(params4D.current.animate, 'rotateXY').name("OnRotateXY");
            guiControlsRef.current.angleXZ = gui.add(params4D.current.rotation, 'angleXZ', 0, 2 * Math.PI).name("RotateXZ (Rotate Y)");
            gui.add(params4D.current.animate, 'rotateXZ').name("OnRotateXZ");
            guiControlsRef.current.angleYZ = gui.add(params4D.current.rotation, 'angleYZ', 0, 2 * Math.PI).name("RotateYZ (Rotate X)");
            gui.add(params4D.current.animate, 'rotateYZ').name("OnRotateYZ");
            guiControlsRef.current.angleXW = gui.add(params4D.current.rotation, 'angleXW', 0, 2 * Math.PI).name("RotateXW");
            gui.add(params4D.current.animate, 'rotateXW').name("OnRotateXW");
            guiControlsRef.current.angleYW = gui.add(params4D.current.rotation, 'angleYW', 0, 2 * Math.PI).name("RotateYW");
            gui.add(params4D.current.animate, 'rotateYW').name("OnRotateYW");
            guiControlsRef.current.angleZW = gui.add(params4D.current.rotation, 'angleZW', 0, 2 * Math.PI).name("RotateZW");
            gui.add(params4D.current.animate, 'rotateZW').name("OnRotateZW");
            gui.add(params4D.current, "show3DAxis").name("Show 3D Axes")
                .onChange((value) => {
                    if (axesRef.current) {
                        axesRef.current.visible = value;
                    }
                    if (axesLabelRef.current) {
                        axesLabelRef.current.visible = value;
                    }
                });
        }

        guiRef.current = gui;
        guiContainerRef.current.appendChild(guiRef.current.domElement);

    }, [geomMode]);

    useEffect(() => {
        if (sceneRef.current !== null && nowPolygonData !== null
             && meshRenderReady) {

            // Remove old mesh from the scene
            if (meshRef.current) {
                sceneRef.current.remove(meshRef.current.mesh);
                sceneRef.current.remove(meshRef.current.wireframe);
                meshRef.current.mesh.geometry.dispose();
                meshRef.current.mesh.material.dispose();
                meshRef.current.wireframe.geometry.dispose();
                meshRef.current.wireframe.material.dispose();
                meshRef.current = null;
            }

            // Create new mesh and add to the scene
            meshRef.current = generateMesh( geomModeRef.current.id, data, nowPolygonData );
            sceneRef.current.add(meshRef.current.mesh);
            sceneRef.current.add(meshRef.current.wireframe);
        }
    }, [nowPolygonData, meshRenderReady]);

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