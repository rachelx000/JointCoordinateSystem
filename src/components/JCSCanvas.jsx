export default function JCSCanvas() {
    return (
        <>
            <div id="joint-coordinate">
                <h3 className="joint-coordinate">Joint Coordinate System</h3>
                <svg id="joint-coordinate-canvas" className="joint-coordinate">
                    {/* Correlation Indicator */}
                    <defs>
                        <filter id="vertical-glowing" x="-100%" y="0%" width="300%" height="100%">
                            <feGaussianBlur stdDeviation={5} result="blur" />
                            <feComponentTransfer in="blur">
                                <feFuncR type="linear" slope={1} />
                                <feFuncG type="linear" slope={1} />
                                <feFuncB type="linear" slope={1} />
                            </feComponentTransfer>
                        </filter>
                        <filter id="horizontal-glowing" x={0} y="-100%" width="100%" height="300%">
                            <feGaussianBlur stdDeviation={5} result="blur" />
                            <feComponentTransfer in="blur">
                                <feFuncR type="linear" slope={1} />
                                <feFuncG type="linear" slope={1} />
                                <feFuncB type="linear" slope={1} />
                            </feComponentTransfer>
                        </filter>
                    </defs>
                    <rect id="left-indicator" className="correlation-indicator" rx={100} filter="url(#vertical-glowing)">
                        <title></title></rect>
                    <rect id="top-indicator" className="correlation-indicator" ry={100} filter="url(#horizontal-glowing)">
                        <title></title></rect>
                    <rect id="right-indicator" className="correlation-indicator" rx={100} filter="url(#vertical-glowing)">
                        <title></title></rect>
                    <rect id="bottom-indicator" className="correlation-indicator" ry={100} filter="url(#horizontal-glowing)">
                        <title></title></rect>
                    {/* Axis Components */}
                    <g id="joint-coordinate-axes">
                        <g id="left-axis">
                            <text id="left-axis-title" />
                        </g>
                        <g id="top-axis">
                            <text id="top-axis-title" />
                        </g>
                        <g id="right-axis">
                            <text id="right-axis-title" />
                        </g>
                        <g id="bottom-axis">
                            <text id="bottom-axis-title" />
                        </g>
                    </g>
                    {/* Main Canvas */}
                    <path id="axis-corner" />
                    <rect id="coord-background" />
                    <g id="polygon-data" />
                    <g id="origin-polygon" className="origin" />
                    <g id="centroids">
                        <g id="centroid-indicators" />
                        <g id="origin-centroid" className="origin" />
                    </g>
                    <circle id="inspected_centroid" />
                    <g id="data-tooltip">
                        <rect />
                        <polygon />
                        <text id="data-tooltip-text" />
                    </g>
                </svg>
                {/* Colorscale */}
                <svg id="colorscale" className="joint-coordinate">
                    <g id="colorscale-content" />
                    <g id="colorscale-axis">
                        <text />
                    </g>
                </svg>
            </div>
        </>
    );
}