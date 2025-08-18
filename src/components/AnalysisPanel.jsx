import { useState, useEffect, useRef } from "react";
import "../css/AnalysisPanel.css";
import PolygonAlignment from "./AnalysisPanel/PolygonAlignment.jsx";
import ShapeAnalysis from "./AnalysisPanel/ShapeAnalysis.jsx";
import { alignPolygons, plotPolygonAlignment, computeAlignedPolygonOrder } from "./AnalysisPanel/PolygonAlignment.js";
import { plotShapeMetric, plotCorrelation, fitEquationForMetric } from "./AnalysisPanel/ShapeAnalysis.js";
import { shape_metrics } from "./AnalysisPanel/ShapeAnalysis.jsx";
import { isEqual } from "lodash";

export default function AnalysisPanel( { data, selectedIVs, selectedDV, nowPolygonData, nowOrigin, onShowCentroids, onColorBlockMode, onInspectMode, inspectedIndex, setInspectedIndex }) {
    const [alignMode, setAlignMode] = useState({mode: 'point', index: 0});
    const [alignedPolygonData, setAlignedPolygonData] = useState(null);
    const [alignedPolygonOrder, setAlignedPolygonOrder] = useState(null);
    const [alignedOriginData, setAlignedOriginData] = useState(null);
    const scatterplotRefs = useRef({});
    const alignmentRef = useRef({});
    const [fittedEquations, setFittedEquations] = useState({});
    const [scatterMode, setScatterMode] = useState("alignment");

    function handleAlignModeChange(e) {
        let curr_align_mode = e.target.getAttribute('class');
        let index = parseInt(e.target.getAttribute('data-index'));
        setAlignMode({ mode: curr_align_mode, index: index });
    }

    useEffect(() => {
        if (nowPolygonData !== null) {
            let aligned_polygons = alignPolygons( nowPolygonData, alignMode );
            setAlignedPolygonData( aligned_polygons );
        } else {
            setAlignedPolygonData( null );
        }
    }, [nowPolygonData, alignMode]);

    useEffect(() => {
        if (alignedPolygonData !== null) {
            let plot = plotPolygonAlignment( alignedPolygonData, nowOrigin, onShowCentroids, onColorBlockMode,
                alignMode, onInspectMode, null, setInspectedIndex, alignedOriginData, setAlignedOriginData );
            plot.resetZoomPan();
            alignmentRef.current = plot;
            let aligned_polygon_order = computeAlignedPolygonOrder( alignedPolygonData, alignMode );
            if (!isEqual(aligned_polygon_order, alignedPolygonOrder))
                setAlignedPolygonOrder(aligned_polygon_order);
        }
    }, [alignedPolygonData]);

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
        if (alignedPolygonData !== null && alignedPolygonOrder !== null && alignedPolygonOrder.length === alignedPolygonData.length) {
            shape_metrics.forEach( (metric) => {
                let plot = (scatterMode === "alignment") ? plotShapeMetric( metric.id, alignedPolygonData, alignedPolygonOrder, onInspectMode, null, setInspectedIndex, alignedOriginData ) :
                    plotCorrelation( metric.id, selectedDV, data, alignedPolygonData, onInspectMode, onInspectMode, null, setInspectedIndex )
                plot.resetZoomPan();
                scatterplotRefs.current[metric.id] = plot;
            });
        }
    }, [scatterMode, alignedPolygonData, alignedPolygonOrder]);

    useEffect(() => {
        if ( alignedPolygonData !== null ) {
            shape_metrics.forEach( (metric) => {
                setFittedEquations(prev => ({
                    ...prev,
                    [metric.id]: fitEquationForMetric( metric.id, selectedIVs, data, alignedPolygonData )
                }));
            });
        }
    }, [alignedPolygonData]);

    useEffect(() => {
        Object.values(scatterplotRefs.current).forEach(plot => {
            if (plot?.updateOrigin && scatterMode === "alignment") {
                plot.updateOrigin(alignedOriginData);
            }
        });
    }, [alignedOriginData]);

    return (
        <>
            <div id="analysis-panel">
                <PolygonAlignment alignMode={ alignMode } handleAlignModeChange={ handleAlignModeChange }
                                  alignmentRef={ alignmentRef } />
                <ShapeAnalysis inspectedIndex={ inspectedIndex } alignedPolygonData={ alignedPolygonData }
                               scatterMode={scatterMode} setScatterMode={ setScatterMode } selectedDV={ selectedDV }
                               scatterplotRefs={ scatterplotRefs } fittedEquations={ fittedEquations }/>
            </div>
        </>
    );
}