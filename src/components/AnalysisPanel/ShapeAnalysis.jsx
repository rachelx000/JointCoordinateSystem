import { useState } from "react";
import { save_as_png } from "../JCS.js";

// eslint-disable-next-line react-refresh/only-export-components
export const shape_metrics = [
    { id: "area", title: "Area" },
    { id: "compactness", title: "Compactness" },
    { id: "diagonal-ratio", title: "Diagonal Ratio" },
    { id: "angular-regularity", title: "Angular Regularity" }
];

export default function ShapeAnalysis({ inspectedIndex, alignedPolygonData, scatterMode, setScatterMode, selectedDV,
                                          scatterplotRefs, fittedEquations, disableControl }) {
    const [showTrend, setShowTrend] = useState({
        "area": false, "compactness": false, "diagonal-ratio": false, "angular-regularity": false
    });

    function handleClickShowTrend(metric_id) {
        setShowTrend(prev => ({
            ...prev,
            [metric_id]: !showTrend[metric_id]
        }));
    }

    function handleChangeScatter(e) {
        setScatterMode(e.target.value);
    }

    return (
        <div id="shape-analysis">
            <select id="scatter-mode-selector" onChange={handleChangeScatter}>
                <option key="alignment" value="alignment">Alignment Trend</option>
                <option key="correlation" value="correlation">Metric & DV</option>
            </select>
            { shape_metrics.map(shape_metric => (
                <div key={shape_metric.id}>
                    <h4 className="scatter-title">{ scatterMode === "alignment" ? ( inspectedIndex === null ? shape_metric.title : shape_metric.title+" = "+alignedPolygonData[inspectedIndex].metrics[shape_metric.id] ) :
                        shape_metric.title+" vs. "+ selectedDV }</h4>
                    <div id={shape_metric.id} className="scatter-container">
                        <img className="scatter-reset-button" src={`${import.meta.env.BASE_URL}assets/reset.png`}
                             onClick={ disableControl ? undefined : () => { scatterplotRefs.current[shape_metric.id]?.resetZoomPan(); }}
                             style={{opacity: disableControl ? "0.4": "0.8"}} alt={"Reset button"} title={"Reset Canvas"}/>
                        <div className="equation-container">
                            <img className="show-equation-icon" src={`${import.meta.env.BASE_URL}assets/equation.png`}
                                 style={{opacity: disableControl ? "0.4": "0.8"}} alt={"Fitted equation button"} title={"Show Fitted Equation"}/>
                            <div id={shape_metric.id+"-equation" } className={ "fitted-equations"+ (fittedEquations[shape_metric.id] && !disableControl ? "" : " no-hover" )}>
                                { fittedEquations[shape_metric.id] }
                            </div>
                        </div>
                        <img className="show-trend-icon" src={`${import.meta.env.BASE_URL}assets/trend.png`}
                             style={{opacity: showTrend[shape_metric.id]&&!disableControl ? "0.8": "0.4"}}
                             onClick={ disableControl ? undefined : () => handleClickShowTrend(shape_metric.id) }
                             alt={"Line trend button"} title={"Show Fitted Line"}/>
                        <img className="save-scatter-button" src={`${import.meta.env.BASE_URL}assets/save.png`}
                             style={{opacity: disableControl ? "0.4": "0.8"}}
                             onClick={ disableControl ? undefined : () => save_as_png(shape_metric.id+"-scatter-canvas-container", shape_metric.id+"-scatter", 4) }
                             alt={"Save scatter button"} title={"Save Scatterplot"}/>
                        <div id={shape_metric.id+"-scatter-canvas-container"} className="scatter-canvas-container">
                            <svg>
                                <rect className={"scatterplot-canvas "+shape_metric.id+"-scatterplot"}></rect>
                                <g>
                                    <g id={shape_metric.id+"-x-axis"}/>
                                    <text id={shape_metric.id+"-x-title"}></text>
                                    <g id={shape_metric.id+"-y-axis"}/>
                                    <text id={shape_metric.id+"-y-title"}></text>
                                </g>
                                <g id={shape_metric.id+"-data"} className={shape_metric.id+"-scatterplot"}/>
                                <line id={shape_metric.id+"-origin"} className={shape_metric.id+"-scatterplot"}/>
                                <g id={shape_metric.id+"-trend-info"} className="scatter-trend-info" style={{opacity: showTrend[shape_metric.id] ? "1.0" : "0"}}>
                                    <path id="line-highlight" className={shape_metric.id+"-scatterplot"}></path>
                                    <path id="line" className={shape_metric.id+"-scatterplot"}></path>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}