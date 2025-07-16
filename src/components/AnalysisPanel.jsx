import { useEffect } from "react";
import '../css/AnalysisPanel.css';
import PolygonAlignment from "./PolygonAlignment.jsx";
import ShapeAnalysis from "./ShapeAnalysis.jsx";
import { polygonAlignment, shapeAnalysis } from './AnalysisPanel.js';

export default function AnalysisPanel( { nowPolygonData }) {
    useEffect(() => {
        if (nowPolygonData !== null) {
            polygonAlignment( nowPolygonData );
            shapeAnalysis( nowPolygonData );
        }
    }, [nowPolygonData]);

    return (
        <>
            <div id="analysis-panel">
                <PolygonAlignment />
                <ShapeAnalysis />
            </div>
        </>
    );
}