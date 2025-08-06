// eslint-disable-next-line react-refresh/only-export-components
export const shape_metrics = [
    { id: "area", title: "Area" },
    { id: "compactness", title: "Compactness" },
    { id: "diagonal-ratio", title: "Diagonal Ratio" },
    { id: "angular-regularity", title: "Angular Regularity" }
];

export default function ShapeAnalysis({ inspectedIndex, alignedPolygonData, scatterplotRefs }) {
    return (
        <div id="shape-analysis">
            { shape_metrics.map(shape_metric => (
                <div key={shape_metric.id}>
                    <h4 className="scatter-title">{ inspectedIndex === null ? shape_metric.title : shape_metric.title+" = "+alignedPolygonData[inspectedIndex].metrics[shape_metric.id]}</h4>
                    <div id={shape_metric.id} className="scatter-container">
                        <img className="scatter-reset-button" src={`${import.meta.env.BASE_URL}assets/reset.png`} onClick={() => { scatterplotRefs.current[shape_metric.id]?.resetZoomPan(); }} />
                        <svg>
                            <rect className={"scatterplot-canvas "+shape_metric.id+"-scatterplot"}></rect>
                            <g>
                                <g id={shape_metric.id+"-x-axis"}/>
                                <g id={shape_metric.id+"-y-axis"}/>
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