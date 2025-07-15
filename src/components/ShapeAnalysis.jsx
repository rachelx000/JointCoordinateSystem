import '../css/ShapeAnalysis.css';

export default function ShapeAnalysis() {
    return (
        <>
            <div id="shape-analysis">
            <div id="alignments">
                <h3>Polygon Alignment</h3>
                <svg transform="translate(-20, -120) scale(0.8 0.8)">
                    <g transform="translate(0, 30)">
                        <rect width={205} height={370} x={18} y={75} fill="#FFF" />
                        <g className="alignment-axis">
                            {/* x-axis */}
                            <line x1={18} y1={260} x2={223} y2={260} stroke="black" />
                            <polygon points="50 15, 100 100, 0 100" style={{"fill":"black"}} transform="translate(233, 255) scale(0.1 0.1) rotate(90 1 1)" />
                            <text x={235} y={263}>x</text>
                            {/* y-axis */}
                            <line x1={18} y1={75} x2={18} y2={445} stroke="black" />
                            <polygon points="50 15, 100 100, 0 100" style={{"fill":"black"}} transform="translate(13, 65) scale(0.1 0.1)" />
                            <text x={15} y={60}>y</text>
                        </g>
                        <g id="polygons-alignment" transform="translate(20, 260)" />
                        <g id="reference-alignment" transform="translate(20, 260)" />
                        <polygon id="inspected_aligned_polygon" transform="translate(20, 260)" />
                        <g id="centroids-alignment" transform="translate(20, 260)">
                            <g id="centroids_alignment" />
                            <g id="reference_centroid_alignment" />
                        </g>
                        <circle id="inspected_aligned_centroid" transform="translate(20, 260)" />
                    </g>
                </svg>
            </div>
            <div id="scatterplots">
                <h3>Shape Analysis</h3>
                <svg id="sphericity">
                    <rect className="scatterplot-canvas" width={300} height={125} x={40} y={25} />
                    <g id="sphericity_x_axis" transform="translate(40, 125)" />
                    <g id="sphericity_y_axis" transform="translate(40, 25)" />
                    <g id="sphericity_data" transform="translate(40, 25)" />
                    <g id="sphericity_reference" transform="translate(40, 25)" />
                    <text className="scatter-title" transform="translate(140, 14)">Sphericity</text>
                </svg>
                <svg id="compactness">
                    <rect className="scatterplot-canvas" width={300} height={125} x={40} y={25} />
                    <g id="compactness_x_axis" transform="translate(40, 125)" />
                    <g id="compactness_y_axis" transform="translate(40, 25)" />
                    <g id="compactness_data" transform="translate(40, 25)" />
                    <g id="compactness_reference" transform="translate(40, 25)" />
                    <text className="scatter-title" transform="translate(140, 14)">Compactness</text>
                </svg>
                <svg id="diagonal_ratio">
                    <rect className="scatterplot-canvas" width={300} height={125} x={40} y={25} />
                    <g id="diagonal_ratio_x_axis" transform="translate(40, 125)" />
                    <g id="diagonal_ratio_y_axis" transform="translate(40, 25)" />
                    <g id="diagonal_ratio_data" transform="translate(40, 25)" />
                    <g id="diagonal_ratio_reference" transform="translate(40, 25)" />
                    <text className="scatter-title" transform="translate(140, 14)">Diagonal Ratio</text>
                </svg>
                <svg id="angular_regularity">
                    <rect className="scatterplot-canvas" width={300} height={125} x={40} y={25} />
                    <g id="angular_regularity_x_axis" transform="translate(40, 125)" />
                    <g id="angular_regularity_y_axis" transform="translate(40, 25)" />
                    <g id="angular_regularity_data" transform="translate(40, 25)" />
                    <g id="angular_regularity_reference" transform="translate(40, 25)" />
                    <text className="scatter-title" transform="translate(140, 14)">Angular Regularity</text>
                </svg>
            </div>
            </div>
        </>
    )
}