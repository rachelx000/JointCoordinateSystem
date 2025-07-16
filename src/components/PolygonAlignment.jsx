export default function PolygonAlignment() {
    return(
        <div id="polygon-alignment">
            <h3>Polygon Alignment</h3>
            <svg>
                <g>
                    <rect width={205} height={370} x={18} y={75} fill="#FFF" />
                    { ["alignment-x-axis", "alignment-y-axis"].map(title => (
                        <g key={title} id={title}>
                            <line></line>
                            <polygon></polygon>
                            <text></text>
                        </g>
                    ))}
                    <g id="polygons-alignment" />
                    <g id="reference-alignment" />
                    <polygon id="inspected_aligned_polygon" />
                    <g id="centroids-alignment">
                        <g id="centroids_alignment" />
                        <g id="reference_centroid_alignment" />
                    </g>
                    <circle id="inspected_aligned_centroid" />
                </g>
            </svg>
        </div>
    );
}