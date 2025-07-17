import { useEffect } from "react";
import '../css/AnalysisPanel.css';
import PolygonAlignment from "./PolygonAlignment.jsx";
import ShapeAnalysis from "./ShapeAnalysis.jsx";
import { polygonAlignment, shapeAnalysis } from './AnalysisPanel.js';

export default function AnalysisPanel( { nowPolygonData, nowOrigin, onShowCentroids }) {
    useEffect(() => {
        if (nowPolygonData !== null) {
            polygonAlignment( nowPolygonData, nowOrigin, onShowCentroids );
            shapeAnalysis( nowPolygonData, nowOrigin );
        }
    }, [nowPolygonData, nowOrigin, onShowCentroids]);

    return (
        <>
            <div id="analysis-panel">
                <PolygonAlignment />
                <ShapeAnalysis />
            </div>
        </>
    );
}