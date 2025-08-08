import { useEffect, useRef } from "react";
import { initializeRender } from "../GeometryVis.js";

export default function Hypercube({ data, ifRender, selectedIVs, selectedDV, colorScheme }) {
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