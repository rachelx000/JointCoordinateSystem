import {useEffect, useState} from "react";
import "../css/Comparison.css"
import PCP from "./Comparison/PCP.jsx"

const plots = [
    {   name: 'Parallel Coordinate Plot', id: 'pcp'   },
    {   name: 'Spider Chart', id: 'spider'   },
    {   name: 'Hypercube Plot', id: 'hypercube'   },
]

export default function ComparisonPanel({ data, ifRender, selectedIVs, selectedDV, colorScheme }) {
    const [selectedPlot, setSelectedPlot] = useState("pcp");

    function handleChangePlot(e) {
        setSelectedPlot(e.target.value);
    }

    useEffect(() => {
        console.log("Current Selected Plot: ", selectedPlot);
    }, [selectedPlot])

    function switchPlots( nowPlot ) {
        switch ( nowPlot ) {
            case 'pcp':
                return <PCP data={ data } ifRender={ ifRender } selectedIVs={ selectedIVs } selectedDV={ selectedDV }
                            colorScheme={ colorScheme }/>
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