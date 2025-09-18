import { useState, useEffect, useRef, useMemo } from "react";
import "../css/AnalysisPanel.css";
import PolygonAlignment from "./AnalysisPanel/PolygonAlignment.jsx";
import ShapeAnalysis from "./AnalysisPanel/ShapeAnalysis.jsx";
import { alignPolygons, plotPolygonAlignment, computeAlignedPolygonOrder } from "./AnalysisPanel/PolygonAlignment.js";
import {
    plotShapeMetric,
    plotCorrelation,
    fitEquationForMetric,
    computeTrendForMetric,
    computeTrendForCorr,
    generatePathFromQuadReg
} from "./AnalysisPanel/ShapeAnalysis.js";
import { shape_metrics } from "./AnalysisPanel/ShapeAnalysis.jsx";
import { isEqual } from "lodash";
import  { sortPolygonsByDepVarVal } from "./Comparison.js";
import * as d3 from 'd3';

export default function AnalysisPanel( { data, selectedIVs, selectedDV, nowPolygonData, nowOrigin, onShowCentroids,
                                           onColorBlockMode, onInspectMode, inspectedIndex, setInspectedIndex,
                                           sidePanelRenderReady, disableControl }) {
    const [alignMode, setAlignMode] = useState({mode: 'point', index: 0});
    const [alignedPolygonData, setAlignedPolygonData] = useState(null);
    const [alignedPolygonOrder, setAlignedPolygonOrder] = useState(null);
    const [alignedOriginData, setAlignedOriginData] = useState(null);
    const scatterplotRefs = useRef({});
    const [scatterComplete, setScatterComplete] = useState(false);
    const alignmentRef = useRef({});
    const [fittedEquations, setFittedEquations] = useState({});
    const [scatterTrends, setScatterTrends] = useState({});
    const [fitComplete, setFitComplete] = useState(false);
    const [scatterMode, setScatterMode] = useState("alignment");

    function handleAlignModeChange(e) {
        let curr_align_mode = e.target.getAttribute('class');
        let index = parseInt(e.target.getAttribute('data-index'));
        setAlignMode({ mode: curr_align_mode, index: index });
    }

    useEffect(() => {
        setScatterComplete(false);
        if (nowPolygonData !== null) {
            let aligned_polygons = alignPolygons( nowPolygonData, alignMode );
            setAlignedPolygonData( aligned_polygons );
        } else {
            setAlignedPolygonData( null );
        }
    }, [nowPolygonData, alignMode]);

    useEffect(() => {
        setScatterComplete(false);
        if (sidePanelRenderReady && alignedPolygonData !== null) {
            let plot = plotPolygonAlignment( alignedPolygonData, nowOrigin, onShowCentroids, onColorBlockMode,
                alignMode, onInspectMode, null, setInspectedIndex, alignedOriginData, setAlignedOriginData );
            plot.resetZoomPan();
            alignmentRef.current = plot;
            let aligned_polygon_order = scatterMode === "alignment" ? computeAlignedPolygonOrder( alignedPolygonData, alignMode ) :
                sortPolygonsByDepVarVal(nowPolygonData);
            if (!isEqual(aligned_polygon_order, alignedPolygonOrder))
                setAlignedPolygonOrder(aligned_polygon_order);
        }
    }, [sidePanelRenderReady, alignedPolygonData, scatterMode]);

    useEffect(() => {
        if (alignedPolygonData !== null) {
            if (alignmentRef.current?.updateInspectedIndex) {
                alignmentRef.current.updateInspectedIndex(inspectedIndex);
            }

            Object.values(scatterplotRefs.current).forEach(plot => {
                if (plot?.updateInspectedIndex) {
                    plot.updateInspectedIndex(inspectedIndex);
                }
            });
        }
    }, [inspectedIndex]);

    useEffect(() => {
        if (alignmentRef.current?.updateInspectMode) {
            alignmentRef.current.updateInspectMode(onInspectMode);
        }
        Object.values(scatterplotRefs.current).forEach(plot => {
            if (plot?.updateInspectMode) {
                plot.updateInspectMode(onInspectMode);
            }
        });
    }, [onInspectMode]);

    useEffect(() => {
        if (alignmentRef.current?.updateColorBlockMode) {
            alignmentRef.current.updateColorBlockMode(onColorBlockMode);
        }
    }, [onColorBlockMode]);

    useEffect(() => {
        if (alignmentRef.current?.updateCentroids) {
            alignmentRef.current.updateCentroids(onShowCentroids);
        }
    }, [onShowCentroids]);

    useEffect(() => {
        if (alignmentRef.current?.updateOrigin) {
            alignmentRef.current.updateOrigin(nowOrigin, alignedOriginData);
        }
    }, [nowOrigin, alignedOriginData]);

    useEffect(() => {
        setScatterComplete(false);
    }, [scatterMode, alignedPolygonOrder])

    useEffect(() => {
        if ( sidePanelRenderReady && alignedPolygonData !== null && alignedPolygonOrder !== null && alignedPolygonOrder.length === alignedPolygonData.length
            && !scatterComplete ) {
            shape_metrics.forEach((metric) => {
                d3.select('#' + metric.id + '-data').selectAll('*').remove();
            });
            shape_metrics.forEach( (metric) => {
                let plot = (scatterMode !== "correlation") ? plotShapeMetric( metric.id, alignedPolygonData, alignedPolygonOrder, onInspectMode, null, setInspectedIndex, alignedOriginData ) :
                    plotCorrelation( metric.id, selectedDV, data, alignedPolygonData, onInspectMode, onInspectMode, null, setInspectedIndex )
                plot.resetZoomPan();
                scatterplotRefs.current[metric.id] = plot;
            });
            setScatterComplete(true);
            setFitComplete(false);
        }
    }, [sidePanelRenderReady, scatterComplete, alignedPolygonData, alignedPolygonOrder]);

    useEffect(() => {
        if ( scatterComplete && alignedPolygonData.length === alignedPolygonOrder.length ) {
            shape_metrics.forEach( (metric) => {
                setFittedEquations(prev => ({
                    ...prev,
                    [metric.id]: fitEquationForMetric( metric.id, selectedIVs, data, alignedPolygonData )
                }));
                setScatterTrends( prev => ({
                    ...prev,
                    [metric.id]: (scatterMode !== "correlation") ? computeTrendForMetric( metric.id, alignedPolygonData, alignedPolygonOrder )
                        : computeTrendForCorr( metric.id, alignedPolygonData, alignedPolygonOrder )
                }));
            });
            setFitComplete(true);
        }
    }, [scatterComplete]);

    useEffect(() => {
        if ( fitComplete ) {
            shape_metrics.forEach( (metric) => {
                generatePathFromQuadReg( metric.id, scatterTrends[metric.id].points, scatterplotRefs.current[metric.id].xScale, scatterplotRefs.current[metric.id].yScale )
            });
        }
    }, [fitComplete])

    useEffect(() => {
        Object.values(scatterplotRefs.current).forEach(plot => {
            if (plot?.updateOrigin && scatterMode !== "correlation") {
                plot.updateOrigin(alignedOriginData);
            }
        });
    }, [alignedOriginData]);

    return (
        <>
            <div id="analysis-panel">
                <PolygonAlignment alignMode={ alignMode } handleAlignModeChange={ handleAlignModeChange }
                                  alignmentRef={ alignmentRef } disableControl={ disableControl } />
                <ShapeAnalysis inspectedIndex={ inspectedIndex } alignedPolygonData={ alignedPolygonData }
                               scatterMode={scatterMode} setScatterMode={ setScatterMode } selectedDV={ selectedDV }
                               scatterplotRefs={ scatterplotRefs } fittedEquations={ fittedEquations }
                               scatterTrends={ scatterTrends } disableControl={ disableControl }/>
            </div>
        </>
    );
}