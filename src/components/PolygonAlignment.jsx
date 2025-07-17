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
                    <g id="aligned-origin-polygon" className="aligned-origin"/>
                    <g id="centroids-alignment" />
                    <g id="aligned-origin-centroid" className="aligned-origin"/>
                </g>
            </svg>
        </div>
    );
}