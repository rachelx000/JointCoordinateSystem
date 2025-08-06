import { useEffect } from "react";
import { drawPCP } from "../Comparison.js";

let currSelectedIVs = [];
let currSelectedDV = null;
let currData = null;

export default function PCP({ data, ifRender, selectedIVs, selectedDV, colorScheme }) {

    useEffect(() => {
        if ( ifRender && data !== null ) {
            currData = data;
            currSelectedIVs = selectedIVs;
            currSelectedDV = selectedDV;
        }
        if ( currData !== null ) {
            drawPCP( currData, currSelectedIVs, currSelectedDV, colorScheme );
        }
    }, [ifRender, selectedIVs, selectedDV, colorScheme])

    return (
        <div id="pcp">
            <h3>Parallel Coordinate Plot (PCP)</h3>
            <div id="pcp-container"></div>
        </div>
    )
}