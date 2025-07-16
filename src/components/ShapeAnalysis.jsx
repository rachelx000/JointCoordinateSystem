export default function ShapeAnalysis() {
    return (
        <div id="shape-analysis">
            <h3>Shape Metrics</h3>
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
    );
}