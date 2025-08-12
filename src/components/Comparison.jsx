import { useEffect, useState } from "react";
import "../css/Comparison.css"
import PCP from "./Comparison/PCP.jsx"
import Hypercube from "./Comparison/Hypercube.jsx";
import SpiderPlot from "./Comparison/SpiderPlot.jsx";

const plots = [
    {   name: 'Parallel Coordinate Plot', id: 'pcp'   },
    {   name: 'Spider Chart', id: 'spider'   },
    {   name: 'Hypercube Plot', id: 'hypercube'   },
]

export default function ComparisonPanel({ data, nowPolygonData, selectedIVs, selectedDV, colorScheme,
                                            onColorBlockMode, onInspectMode, onOriginMode, nowOrigin, inspectedIndex, setInspectedIndex,
                                            sidePanelRenderReady }) {
    const [selectedPlot, setSelectedPlot] = useState("pcp");

    function handleChangePlot(e) {
        setSelectedPlot(e.target.value);
    }

    /* useEffect(() => {
        console.log("Current Selected Plot: ", selectedPlot);
    }, [selectedPlot]) */

    function switchPlots( nowPlot ) {
        switch ( nowPlot ) {
            case 'pcp':
                return <PCP data={ data } selectedIVs={ selectedIVs } selectedDV={ selectedDV }
                            colorScheme={ colorScheme } sidePanelRenderReady={ sidePanelRenderReady } onOriginMode={ onOriginMode } />
            case 'spider':
                return <SpiderPlot data={ data } nowJCSPolygonData={ nowPolygonData }
                                   selectedIVs={ selectedIVs } selectedDV={ selectedDV } colorScheme={ colorScheme }
                                   onColorBlockMode={ onColorBlockMode } onOriginMode={ onOriginMode } nowOrigin={ nowOrigin }
                                   onInspectMode={ onInspectMode }  inspectedIndex={ inspectedIndex }
                                   setInspectedIndex={ setInspectedIndex } sidePanelRenderReady={ sidePanelRenderReady } />
            case 'hypercube':
                return <Hypercube data={ data } selectedIVs={ selectedIVs } selectedDV={ selectedDV }
                                  colorScheme={ colorScheme } sidePanelRenderReady={ sidePanelRenderReady } />
        }
    }

    return (
        <div id="comparison-panel">
            <select id="plot-selector" onChange={ handleChangePlot }>
                { plots.map(plot => (
                    <option key={ plot.id } value={ plot.id }>{ plot.name }</option>
                ))}
            </select>
            { switchPlots( selectedPlot ) }
        </div>
    )
}