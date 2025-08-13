import { useEffect, useRef } from "react";
import {
    initializeRender,
    make4DRotationMatrix,
} from "../GeometryVis.js";
import {
    generateHypercubeScales,
    generateHypercubeAxes,
    update4DRotationHypercube, generateHypercubeAxesTicks, generateHypercubeData
} from "../Comparison.js";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import * as THREE from 'three';

export default function Hypercube({ data, nowPolygonData, selectedIVs, selectedDV, colorScheme, onOriginMode, sidePanelRenderReady, inspectedIndex}) {
    let params = useRef({
        animate: { rotateXY: false, rotateXZ: false, rotateYZ: false, rotateXW: false, rotateYW: false, rotateZW: false },
        rotation: { angleXY: 0, angleXZ: 0, angleYZ: 0, angleXW: 0, angleYW: 0, angleZW: 0 },
        showAxisTicks: false,
        show3DAxis: true
    });

    const renderRef = useRef(null);
    const sceneRef = useRef(null);
    const meshRef = useRef(null);
    const guiRef = useRef(null);
    const guiContainerRef = useRef(null);
    const scalesRef = useRef(null);
    const axesTicksRef = useRef(null);
    const indicatorRef = useRef(null);
    const inspectedIndexRef = useRef(null);
    const axesRef = useRef(null);
    const axesLabelRef = useRef(null);

    // Initialize the rendering engine once
    useEffect(() => {
        const [ scene, camera, renderer, controls, labels, axes ] = initializeRender(renderRef.current, [7, 5, 7], 6);

        sceneRef.current = scene;
        meshRef.current = {
            axisGroup: new THREE.Group(),
            axisTicksGroup: new THREE.Group,
            dataGroup: new THREE.Group()
        }
        // initialize the hypercube grid for axes
        generateHypercubeAxes( meshRef.current.axisGroup );
        scene.add(meshRef.current.axisGroup);
        axesRef.current = axes;
        axesLabelRef.current = labels;

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
        gui.add( params.current, "showAxisTicks").name("Show Axis Ticks")
            .onChange((value) => {
                if (meshRef.current?.axisTicksGroup) {
                    meshRef.current.axisTicksGroup.visible = value;
                }
            });
        gui.add( params.current, "show3DAxis").name("Show 3D Axes")
            .onChange((value) => {
                if (axesRef.current) {
                    axesRef.current.visible = value;
                }
                if (axesLabelRef.current) {
                    axesLabelRef.current.visible = value;
                }
            });


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
                update4DRotationHypercube(meshRef.current, indicatorRef.current, inspectedIndexRef.current, rotation_matrix);
            }

            controls.update();
            renderer.render(scene, camera);
            labels.children.forEach(label_mesh => label_mesh.lookAt(camera.position));
        }

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
        if ( sidePanelRenderReady && sceneRef.current !== null && data !== null && nowPolygonData !== null && nowPolygonData.length === data.length ) {
            [scalesRef.current, axesTicksRef.current] = generateHypercubeScales( data, selectedIVs, selectedDV, colorScheme, onOriginMode );
            generateHypercubeAxesTicks( axesTicksRef.current, meshRef.current.axisTicksGroup, selectedIVs, scalesRef.current );
            sceneRef.current.add( meshRef.current.axisTicksGroup );
            generateHypercubeData( data, nowPolygonData, meshRef.current.dataGroup, selectedIVs, selectedDV, scalesRef.current );
            sceneRef.current.add( meshRef.current.dataGroup );
        }
    }, [data, nowPolygonData, sidePanelRenderReady, colorScheme])

    useEffect(() => {
        if (sceneRef !== null && indicatorRef.current !== null) {
            sceneRef.current.remove(indicatorRef.current);
            indicatorRef.current.geometry.dispose();
            indicatorRef.current.material.dispose();
            indicatorRef.current = null;
        }
        if (meshRef !== null && inspectedIndex !== null) {
            inspectedIndexRef.current = inspectedIndex;
            let data_meshes = meshRef.current.dataGroup.children;
            let inspected_data = data_meshes[inspectedIndex];
            let inspected_p = new THREE.Vector3(
                inspected_data.position.x,
                inspected_data.position.y,
                inspected_data.position.z
            );
            let indicator_geometry = new THREE.SphereGeometry(0.1, 8, 8);
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
        <div id="hypercube">
            <h3>Hypercube Plot</h3>
            <div id="hypercube-container" ref={ renderRef }></div>
            <div id="hypercube-gui-container" ref={ guiContainerRef }></div>
        </div>
    )
}