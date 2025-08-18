// eslint-disable-next-line react-refresh/only-export-components
export const shape_metrics = [
    { id: "area", title: "Area" },
    { id: "compactness", title: "Compactness" },
    { id: "diagonal-ratio", title: "Diagonal Ratio" },
    { id: "angular-regularity", title: "Angular Regularity" }
];

export default function ShapeAnalysis({ inspectedIndex, alignedPolygonData, scatterMode, setScatterMode, selectedDV,
                                          scatterplotRefs, fittedEquations }) {
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
                        <img className="scatter-reset-button" src={`${import.meta.env.BASE_URL}assets/reset.png`} onClick={() => { scatterplotRefs.current[shape_metric.id]?.resetZoomPan(); }} />
                        <div className="equation-container">
                            <img className="show-equation-icon" src={`${import.meta.env.BASE_URL}assets/equation.png`} />
                            <div id={shape_metric.id+"-equation" } className={ "fitted-equations"+ (fittedEquations[shape_metric.id] ? "" : " no-hover" )}>
                                { fittedEquations[shape_metric.id] }
                            </div>
                        </div>
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
                        </svg>
                    </div>
                </div>
            ))}
        </div>
    );
}