import { useState, useEffect, useRef } from "react";
import { drawSpider, sortPolygonsByDepVarVal, plotScatterForArea } from "../Comparison.js";

let currSelectedIVs = [];
let currSelectedDV = null;
let currData = null;

export default function SpiderPlot({ data, nowJCSPolygonData, ifRender, selectedIVs, selectedDV, colorScheme,
                                       onColorBlockMode, onInspectMode, inspectedIndex, setInspectedIndex }) {

    const [jcsOrder, setJCSOrder] = useState(null);
    const [spiderPolygons, setSpiderPolygons] = useState(null);
    const [spiderOrder, setSpiderOrder] = useState(null);
    const spiderRef = useRef(null);
    const scatterplotRefs = useRef({});

    const scatterPlots = [
        {   id: "jcs-area", title: "JCS Polygon Area", polygons: nowJCSPolygonData, polygonOrder: jcsOrder  },
        {   id: "spider-area", title: "Spider Polygon Area", polygons: spiderPolygons, polygonOrder: spiderOrder }
    ]

    useEffect(() => {
        if ( ifRender && data !== null ) {
            currData = data;
            currSelectedIVs = selectedIVs;
            currSelectedDV = selectedDV;
        }
        if ( currData !== null ) {
            spiderRef.current = drawSpider( currData, currSelectedIVs, currSelectedDV, colorScheme,
                spiderPolygons, setSpiderPolygons, onColorBlockMode, inspectedIndex );
        }
    }, [ifRender, selectedIVs, selectedDV, colorScheme])

    useEffect(() => {
        if ( nowJCSPolygonData !== null ) {
            let currJCSOrder = sortPolygonsByDepVarVal(nowJCSPolygonData);
            setJCSOrder(currJCSOrder);
        }
    }, [nowJCSPolygonData])

    useEffect(() => {
        if ( spiderPolygons !== null ) {
            let currSpiderOrder = sortPolygonsByDepVarVal(spiderPolygons);
            setSpiderOrder(currSpiderOrder);
        }
    }, [spiderPolygons])

    useEffect(() => {
        if (jcsOrder !== null && spiderOrder !== null &&
                jcsOrder.length === nowJCSPolygonData.length &&
                jcsOrder.length === spiderOrder.length) {
            scatterPlots.forEach( (scatter) => {
                let plot = plotScatterForArea( scatter.id, scatter.polygons, scatter.polygonOrder, onInspectMode, null, setInspectedIndex );
                plot.resetZoomPan();
                scatterplotRefs.current[scatter.id] = plot;
            });
        }
    }, [jcsOrder, spiderOrder]);

    useEffect(() => {
        if ( scatterplotRefs.current ) {
            Object.values(scatterplotRefs.current).forEach(plot => {
                if (plot?.updateInspectMode) {
                    plot.updateInspectMode(onInspectMode);
                }
            });
        }
    }, [onInspectMode]);

    useEffect(() => {
        if ( spiderRef.current ) {
            if (spiderRef.current?.updateColorBlockMode) {
                spiderRef.current.updateColorBlockMode(onColorBlockMode);
            }
        }
    }, [onColorBlockMode]);

    useEffect(() => {
        if ( spiderRef.current ) {
            if (spiderRef.current?.updateInspectedIndex) {
                spiderRef.current.updateInspectedIndex(inspectedIndex);
            }
        }
        if ( scatterplotRefs.current ) {
            Object.values(scatterplotRefs.current).forEach(plot => {
                if (plot?.updateInspectedIndex) {
                    plot.updateInspectedIndex(inspectedIndex);
                }
            });
        }
    }, [inspectedIndex]);

    return (
        <div id="spider">
            <div id="spider-main">
                <h4>Spider Plot / Radar Chart</h4>
                <svg id="spider-canvas">
                    <g id="spider-grid"></g>
                    <g id="spider-axes">
                        <g id="left-axis">
                            <text id="left-axis-title"></text>
                        </g>
                        <g id="right-axis">
                            <text id="right-axis-title"></text>
                        </g>
                        <g id="top-axis">
                            <text id="top-axis-title"></text>
                        </g>
                        <g id="bottom-axis">
                            <text id="bottom-axis-title"></text>
                        </g>
                    </g>
                    <g id="spider-colorscale">
                        <g id="spider-colorscale-content"></g>
                        <g id="spider-colorscale-axis">
                            <text></text>
                        </g>
                    </g>
                    <g id="spider-polygons"></g>
                </svg>
            </div>
            <div id="area-comparison">
                <h4>Polygon Area Comparison</h4>
                <div id="area-scatterplots">
                    { scatterPlots.map(scatter => (
                        <div key={scatter.id}>
                            <h4 className="scatter-title">{ inspectedIndex === null ? scatter.title : scatter.title+" = "+scatter.polygons[inspectedIndex].area}</h4>
                            <div id={scatter.id} className="scatter-container">
                                <img className="scatter-reset-button" src={`${import.meta.env.BASE_URL}assets/reset.png`} onClick={() => { scatterplotRefs.current[scatter.id]?.resetZoomPan(); }} />
                                <svg>
                                    <rect className={"scatterplot-canvas "+scatter.id+"-scatterplot"}></rect>
                                    <g>
                                        <g id={scatter.id+"-x-axis"}/>
                                        <g id={scatter.id+"-y-axis"}/>
                                    </g>
                                    <g id={scatter.id+"-data"} className={scatter.id+"-scatterplot"}/>
                                    <line id={scatter.id+"-origin"} className={scatter.id+"-scatterplot"}/>
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}