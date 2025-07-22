import { useState, useEffect, useRef } from "react";
import "../css/AnalysisPanel.css";
import PolygonAlignment from "./PolygonAlignment.jsx";
import ShapeAnalysis from "./ShapeAnalysis.jsx";
import { alignPolygons, plotPolygonAlignment } from "./PolygonAlignment.js";
import { plotShapeMetric } from "./ShapeAnalysis.js";
import { shape_metrics } from "./ShapeAnalysis.jsx";
import { isEqual } from "lodash";

export default function AnalysisPanel( { nowPolygonData, nowOrigin, onShowCentroids, onColorBlockMode, inspectedIndex }) {
    const [alignMode, setAlignMode] = useState({mode: 'point', index: 0});
    const [alignedPolygonData, setAlignedPolygonData] = useState(null);
    const [alignedPolygonOrder, setAlignedPolygonOrder] = useState(null);
    const scatterplotRefs = useRef({});

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
            let aligned_polygon_order = plotPolygonAlignment( alignedPolygonData, nowOrigin, onShowCentroids, onColorBlockMode, alignMode, inspectedIndex );
            if (!isEqual(aligned_polygon_order, alignedPolygonOrder))
                setAlignedPolygonOrder(aligned_polygon_order);
        }
    }, [alignedPolygonData, nowOrigin, onShowCentroids, onColorBlockMode, inspectedIndex]);


    useEffect(() => {
        if (alignedPolygonData !== null && alignedPolygonOrder !== null) {
            shape_metrics.forEach( (metric) => {
                let plot = plotShapeMetric( metric.id, alignedPolygonData, alignedPolygonOrder, null );
                plot.resetZoomPan();
                scatterplotRefs.current[metric.id] = plot;
            });
        }
    }, [alignedPolygonData, alignedPolygonOrder]);

    useEffect(() => {
        Object.values(scatterplotRefs.current).forEach(plot => {
            if (plot?.updateInspectedIndex) {
                plot.updateInspectedIndex(inspectedIndex);
            }
        });
    }, [inspectedIndex]);

    return (
        <>
            <div id="analysis-panel">
                <PolygonAlignment alignMode={ alignMode } handleAlignModeChange={ handleAlignModeChange } />
                <ShapeAnalysis inspectedIndex={ inspectedIndex } alignedPolygonData={ alignedPolygonData }
                               scatterplotRefs={ scatterplotRefs }/>
            </div>
        </>
    );
}