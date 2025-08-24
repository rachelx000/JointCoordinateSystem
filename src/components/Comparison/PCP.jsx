import { useEffect } from "react";
import { drawPCP } from "../Comparison.js";
import {save_as_png} from "../JCS.js";


export default function PCP({ data, selectedIVs, selectedDV, colorScheme, sidePanelRenderReady,
                                onOriginMode, disableControl }) {

    useEffect(() => {
        if (sidePanelRenderReady && data !== null) {
            drawPCP(data, selectedIVs, selectedDV, onOriginMode, colorScheme);
        }
    }, [sidePanelRenderReady, colorScheme, onOriginMode])

    return (
        <div id="pcp">
            <h3>Parallel Coordinate Plot (PCP)</h3>
            <img id="save-pcp-button" src={`${import.meta.env.BASE_URL}assets/save.png`}
                 style={{opacity: disableControl ? "0.4": "0.8"}}
                 onClick={ disableControl ? undefined : () => save_as_png("pcp-canvas-container", "pcp", 3) }
                 alt={"Save button"} title={"Save PCP"}/>
            <div id="pcp-canvas-container">
                <div id="origin-container"></div>
                <div id="pcp-container"></div>
            </div>
        </div>
    )
}