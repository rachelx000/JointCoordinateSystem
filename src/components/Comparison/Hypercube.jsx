import { useEffect, useRef } from "react";
import {
    initializeRender,
    make4DRotationMatrix,
    update4DRotation
} from "../GeometryVis.js";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';


export default function Hypercube({ data, nowPolygonData, meshRenderingReady, setMeshRenderingReady, inspectedIndex, sidePanelRenderReady }) {
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

        return () => {
            renderer.dispose();
        };
    }, []);

    /* useEffect(() => {
        if ( ifRender && data !== null ) {
            currData = data;
            currSelectedIVs = selectedIVs;
            currSelectedDV = selectedDV;
        }
        if ( currData !== null ) {
            drawPCP( currData, currSelectedIVs, currSelectedDV, colorScheme );
        }
    }, [ifRender, selectedIVs, selectedDV, colorScheme]) */

    return (
        <div id="hypercube">
            <h3>Hypercube Plot</h3>
            <div id="hypercube-container" ref={ renderRef }></div>
        </div>
    )
}