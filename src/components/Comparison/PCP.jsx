import { useEffect } from "react";
import { drawPCP } from "../Comparison.js";


export default function PCP({ data, selectedIVs, selectedDV, colorScheme, sidePanelRenderReady, onOriginMode }) {

    useEffect(() => {
        if (sidePanelRenderReady && data !== null) {
            drawPCP(data, selectedIVs, selectedDV, onOriginMode, colorScheme);
        }
    }, [sidePanelRenderReady, colorScheme, onOriginMode])

    return (
        <div id="pcp">
            <h3>Parallel Coordinate Plot (PCP)</h3>
            <div id="origin-container"></div>
            <div id="pcp-container"></div>
        </div>
    )
}