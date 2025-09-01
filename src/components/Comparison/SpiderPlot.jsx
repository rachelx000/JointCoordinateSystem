import { useState, useEffect, useRef } from "react";
import {
    drawSpider,
    sortPolygonsByDepVarVal,
    plotScatterForArea,
    plotScatterForAreaCorr,
    computeTrendForArea,
    computeTrendForAreaCorr
} from "../Comparison.js";
import { generatePathFromQuadReg } from "../AnalysisPanel/ShapeAnalysis.js";
import { fitEquationForArea } from "../Comparison.js";
import {save_as_png} from "../JCS.js";

export default function SpiderPlot({ data, nowJCSPolygonData, selectedIVs, selectedDV, colorScheme,
                                       onColorBlockMode, onOriginMode, nowOrigin, onInspectMode, inspectedIndex, setInspectedIndex,
                                       sidePanelRenderReady, disableControl }) {

    const [jcsOrder, setJCSOrder] = useState(null);
    const [spiderPolygons, setSpiderPolygons] = useState(null);
    const [spiderOrder, setSpiderOrder] = useState(null);
    const [spiderOrigin, setSpiderOrigin] = useState(null);
    const spiderRef = useRef(null);
    const scatterplotRefs = useRef({});
    const [fitComplete, setFitComplete] = useState({"jcs": false, "spider": false});
    const [fittedEquationsForArea, setFittedEquationsForArea] = useState({});
    const [scatterTrends, setScatterTrends] = useState({});

    const scatterPlots = [
        {   id: "jcs-area", class: "jcs", title: "(JCS) Area", polygons: nowJCSPolygonData, polygonOrder: jcsOrder  },
        {   id: "spider-area", class: "spider", title: "(Spider) Area", polygons: spiderPolygons, polygonOrder: spiderOrder },
        {   id: "jcs-area-corr", class: "jcs", title: "(JCS) Area vs. "+selectedDV, polygons: nowJCSPolygonData, polygonOrder: jcsOrder  },
        {   id: "spider-area-corr", class: "spider", title: "(Spider) Area vs. "+selectedDV, polygons: spiderPolygons, polygonOrder: spiderOrder }
    ]
    const [showTrend, setShowTrend] = useState({
        "jcs-area": false, "spider-area": false, "jcs-area-corr": false, "spider-area-corr": false
    });

    function handleClickShowTrend(metric_id) {
        setShowTrend(prev => ({
            ...prev,
            [metric_id]: !showTrend[metric_id]
        }));
    }

    useEffect(() => {
        if ( sidePanelRenderReady && data !== null ) {
            setFitComplete({"jcs": false, "spider": false});
            spiderRef.current = drawSpider( data, selectedIVs, selectedDV, colorScheme,
                spiderPolygons, setSpiderPolygons, setSpiderOrigin, onColorBlockMode, onOriginMode, inspectedIndex );
        }
    }, [sidePanelRenderReady, onOriginMode, colorScheme])

    useEffect(() => {
        if ( nowJCSPolygonData !== null ) {
            let currJCSOrder = sortPolygonsByDepVarVal(nowJCSPolygonData);
            setFittedEquationsForArea(prev => ({
                ...prev,
                ["jcs"]: fitEquationForArea( selectedIVs, data, nowJCSPolygonData )
            }));
            setScatterTrends(prev => ({
                ...prev,
                ["jcs-area"]: computeTrendForArea( nowJCSPolygonData, currJCSOrder ),
                ["jcs-area-corr"]: computeTrendForAreaCorr( nowJCSPolygonData, currJCSOrder )
            }));
            setJCSOrder(currJCSOrder);
            setFitComplete(prev => ({
                ...prev,
                ["jcs"]: true
            }));
        }
    }, [nowJCSPolygonData]);

    useEffect(() => {
        if ( spiderPolygons !== null ) {
            let currSpiderOrder = sortPolygonsByDepVarVal(spiderPolygons);
            setSpiderOrder(currSpiderOrder);
            setFittedEquationsForArea(prev => ({
                ...prev,
                ["spider"]: fitEquationForArea( selectedIVs, data, spiderPolygons )
            }));
            setScatterTrends(prev => ({
                ...prev,
                ["spider-area"]: computeTrendForArea( spiderPolygons, currSpiderOrder ),
                ["spider-area-corr"]: computeTrendForAreaCorr( spiderPolygons, currSpiderOrder )
            }));
            setFitComplete(prev => ({
                ...prev,
                ["spider"]: true
            }));
        }
    }, [spiderPolygons]);

    useEffect(() => {
        if (jcsOrder !== null && spiderOrder !== null &&
                jcsOrder.length === nowJCSPolygonData.length &&
                jcsOrder.length === spiderOrder.length) {
            scatterPlots.forEach( (scatter) => {
                let plot;
                if (scatter.id.includes('corr')) {
                    plot = plotScatterForAreaCorr( scatter.id, selectedDV, data, scatter.polygons, scatter.polygonOrder, onInspectMode, null, setInspectedIndex );
                }
                else {
                    let origin = scatter.id.includes('jcs') ? nowOrigin : spiderOrigin;
                    plot = plotScatterForArea( scatter.id, scatter.polygons, scatter.polygonOrder, onInspectMode, null, setInspectedIndex, onOriginMode, origin );
                }
                plot.resetZoomPan();
                scatterplotRefs.current[scatter.id] = plot;
            });
        }
    }, [jcsOrder, spiderOrder]);

    useEffect(() => {
        if ( fitComplete.spider && fitComplete.jcs ) {
            scatterPlots.forEach(scatter => {
                let curr_scatter = scatterplotRefs.current[scatter.id];
                generatePathFromQuadReg(scatter.id, scatterTrends[scatter.id].points, curr_scatter.xScale, curr_scatter.yScale);
            })
        }

    }, [fitComplete])

    useEffect(() => {
        if ( scatterplotRefs.current ) {
            let plot = Object.values(scatterplotRefs.current)[0];
            if (plot?.updateOrigin) {
                plot.updateOrigin(nowOrigin);
            };
        }
    }, [nowOrigin]);

    useEffect(() => {
        if ( scatterplotRefs.current ) {
            let plot = Object.values(scatterplotRefs.current)[1];
            if (plot?.updateOrigin) {
                plot.updateOrigin(spiderOrigin);
            };
        }
    }, [spiderOrigin]);

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
            if (spiderRef.current?.updateOriginMode) {
                spiderRef.current.updateOriginMode(onOriginMode);
            }
        }

        if ( scatterplotRefs.current ) {
            Object.values(scatterplotRefs.current).forEach(plot => {
                if (plot?.updateOriginMode) {
                    plot.updateOriginMode(onOriginMode);
                }
            });
        }
    }, [onOriginMode]);

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
                <img id="save-spider-button" src={`${import.meta.env.BASE_URL}assets/save.png`}
                     style={{opacity: disableControl ? "0.4": "0.8"}}
                     onClick={ disableControl ? undefined : () => save_as_png("spider-canvas-container", "spider", 3) }
                     alt={"Save button"} title={"Save Spider"}/>
                <div id="spider-canvas-container">
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
                        <polygon id="spider-origin"></polygon>
                    </svg>
                </div>
            </div>
            <div id="area-scatterplots">
                    { scatterPlots.map(scatter => (
                        <div key={scatter.id}>
                            <h4 className="scatter-title">{ scatter.id.includes("corr") ? scatter.title
                                : ( inspectedIndex === null ? scatter.title : scatter.title+" = "+scatter.polygons[inspectedIndex].area )}</h4>
                            <div id={scatter.id} className="scatter-container">
                                <img className="scatter-reset-button" src={`${import.meta.env.BASE_URL}assets/reset.png`}
                                     onClick={ disableControl ? undefined : () => { scatterplotRefs.current[scatter.id]?.resetZoomPan(); }}
                                     style={{opacity: disableControl ? "0.4": "0.8"}} alt={"Reset button"} title={"Reset Canvas"} />
                                <img className="show-equation-icon" src={`${import.meta.env.BASE_URL}assets/equation.png`}
                                     style={{opacity: disableControl ? "0.4": "0.8"}} alt={"Fitted equation button"} title={"Show Equation"} />
                                <div id={scatter.id+"-equation" } className={ "fitted-equations"+ (fittedEquationsForArea[scatter.class] && !disableControl ? "" : " no-hover" )}>
                                    { fittedEquationsForArea[scatter.class] }
                                </div>
                                <img className="show-trend-icon" src={`${import.meta.env.BASE_URL}assets/trend.png`}
                                     style={{opacity: showTrend[scatter.id]&&!disableControl ? "0.8": "0.4"}}
                                     onClick={ disableControl ? undefined : () => handleClickShowTrend(scatter.id) }
                                     alt={"Line trend button"} title={"Show Line Trend"} />
                                <img className="save-scatter-button" src={`${import.meta.env.BASE_URL}assets/save.png`}
                                     style={{opacity: disableControl ? "0.4": "0.8"}}
                                     onClick={ disableControl ? undefined : () => save_as_png(scatter.id+"-scatter-canvas-container", scatter.id+"-scatter", 4) }
                                     alt={"Save scatter button"} title={"Save Scatterplot"}/>
                                <div id={scatter.id+"-scatter-canvas-container"} className="scatter-canvas-container">
                                    <svg>
                                        <rect className={"scatterplot-canvas "+scatter.id+"-scatterplot"}></rect>
                                        <g>
                                            <g id={scatter.id+"-x-axis"}/>
                                            <g id={scatter.id+"-y-axis"}/>
                                        </g>
                                        <g id={scatter.id+"-data"} className={scatter.id+"-scatterplot"}/>
                                        <line id={scatter.id+"-origin"} className={scatter.id+"-scatterplot"}/>
                                        <g id={scatter.id+"-trend-info"} className="scatter-trend-info" style={{opacity: showTrend[scatter.id] ? "1.0" : "0"}}>
                                            <text id="r2" transform="translate(51, 8)">{scatterTrends[scatter.id] && "R^2 = "+scatterTrends[scatter.id].r2}</text>
                                            <path id="line-highlight" className={scatter.id+"-scatterplot"}></path>
                                            <path id="line" className={scatter.id+"-scatterplot"}></path>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    )
}