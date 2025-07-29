import { useState, useEffect, useRef } from "react";
import "../css/AnalysisPanel.css";
import PolygonAlignment from "./PolygonAlignment.jsx";
import ShapeAnalysis from "./ShapeAnalysis.jsx";
import { alignPolygons, plotPolygonAlignment, computeAlignedPolygonOrder } from "./PolygonAlignment.js";
import { plotShapeMetric } from "./ShapeAnalysis.js";
import { shape_metrics } from "./ShapeAnalysis.jsx";
import { isEqual } from "lodash";

export default function AnalysisPanel( { nowPolygonData, nowOrigin, onShowCentroids, onColorBlockMode, onInspectMode, inspectedIndex, setInspectedIndex }) {
    const [alignMode, setAlignMode] = useState({mode: 'point', index: 0});
    const [alignedPolygonData, setAlignedPolygonData] = useState(null);
    const [alignedPolygonOrder, setAlignedPolygonOrder] = useState(null);
    const [alignedOriginData, setAlignedOriginData] = useState(null);
    const scatterplotRefs = useRef({});
    const alignmentRef = useRef({});

    function handleAlignModeChange(e) {
        let mode = e.target.getAttribute('class');
        let index = parseInt(e.target.getAttribute('data-index'));
        setAlignMode({ mode, index });
    }

    useEffect(() => {
        if (nowPolygonData !== null) {
            let aligned_polygons = alignPolygons( nowPolygonData, alignMode );
            setAlignedPolygonData( aligned_polygons );
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
        if (alignmentRef.current?.updateInspectedIndex) {
            alignmentRef.current.updateInspectedIndex(inspectedIndex);
        }

        Object.values(scatterplotRefs.current).forEach(plot => {
            if (plot?.updateInspectedIndex) {
                plot.updateInspectedIndex(inspectedIndex);
            }
        });
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
                let plot = plotShapeMetric( metric.id, alignedPolygonData, alignedPolygonOrder, onInspectMode, null, setInspectedIndex, alignedOriginData );
                plot.resetZoomPan();
                scatterplotRefs.current[metric.id] = plot;
            });
        }
    }, [alignedPolygonData, alignedPolygonOrder]);

    useEffect(() => {
        // console.log("aligned origin data:", alignedOriginData);
        Object.values(scatterplotRefs.current).forEach(plot => {
            if (plot?.updateOrigin) {
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
                               scatterplotRefs={ scatterplotRefs }/>
            </div>
        </>
    );
}