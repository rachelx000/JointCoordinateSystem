import { save_as_png } from "../JCS.js";

const size = 120;
const alignment_modes = [
    {
        name: 'point',
        type: 'circle',
        refs: [
            { id: 'bottom-left-corner', text: 'bottom left corner (var1)', cx: 50, cy: 90 },
            { id: 'bottom-right-corner', text: 'bottom right corner (var2)', cx: 50, cy: 90+size },
            { id: 'top-right-corner', text: 'top right corner (var3)', cx: 50+size, cy: 90+size },
            { id: 'top-left-corner', text: 'top left corner (var4)', cx: 50+size, cy: 90 }
        ]
    },
    {
        name: 'side',
        type: 'rect',
        refs: [
            { id: 'left-side', text: 'left side (var1-var4)', x: 45, y: 105, width: 10, height: size-30 },
            { id: 'bottom-side', text: 'bottom side (var1-var2)', x: 65, y: 85+size, width: size-30, height: 10 },
            { id: 'right-side', text: 'right side (var2-var3)', x: 45+size, y: 105, width: 10, height: size-30 },
            { id: 'top-side', text: 'top side (var3-var4)', x: 65, y: 85,  width: size-30, height: 10 }
        ]
    },
    {
        name: 'centroid',
        type: 'circle',
        refs: [
            { id: 'centroid', text: 'centroid with simplified Procrustes', cx: 50+size*0.5, cy: 90+size*0.5 },
        ]
    }
]

export default function PolygonAlignment({ alignMode, handleAlignModeChange, alignmentRef, disableControl }) {
    return(
        <div id="polygon-alignment">
            <h3>Polygon Alignment</h3>
            <div id="alignment-container">
                <img id="alignment-reset-button" src={`${import.meta.env.BASE_URL}assets/reset.png`}
                     onClick={ disableControl ? undefined : (() => alignmentRef.current?.resetZoomPan()) }
                     style={{opacity: disableControl ? "0.4": "0.8"}} alt={"Reset button"} title={"Reset Canvas"}/>
                <img id="alignment-save-button" src={`${import.meta.env.BASE_URL}assets/save.png`}
                     onClick={ disableControl ? undefined : (() => save_as_png("alignment-canvas-container", "alignment", 3.0)) }
                     style={{opacity: disableControl ? "0.4": "0.8"}} alt={"Save button"} title={"Save Alignment"}/>
                <div id="alignment-canvas-container">
                    <svg id="alignment-canvas" height={330} width={330}>
                        <g>
                            <rect width={330} height={330} fill="#FFF" />
                            { ["alignment-x-axis", "alignment-y-axis"].map(title => (
                                <g key={title} id={title} className="alignment-plot">
                                    <line></line>
                                    <polygon></polygon>
                                    <text></text>
                                </g>
                            ))}
                            <g id="aligned-polygons" className="alignment-plot" />
                            <g id="aligned-origin-polygon" className="alignment-plot aligned-origin"/>
                            <g id="aligned-centroids" className="alignment-plot" />
                            <g id="aligned-origin-centroid" className="alignment-plot aligned-origin"/>
                        </g>
                    </svg>
                </div>
            </div>
            <svg height={330} width={200}>
                <defs>
                    <linearGradient id="colorGradient"
                                    x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(9, 12, 155, 1)" />
                        <stop offset="60%" stopColor="rgba(48, 102, 190, 1)" />
                    </linearGradient>
                </defs>
                {alignment_modes.map(mode => (
                    <g key={mode.name}>
                        { mode.refs.map((ref, i) => {
                            const isActive = (alignMode.mode === mode.name) && (alignMode.index === i);
                            const commonProps = {
                                className: mode.name,
                                'data-index': i,
                                onClick: handleAlignModeChange,
                                fill: isActive ? 'url(#colorGradient)' : '#eaeaea',
                                fillOpacity: 1.0,
                                stroke: isActive ? "#0a2463" : "#3c3744",
                                strokeWidth: 1.5,
                                strokeOpacity: isActive ? 0.8 : 0.3
                            }

                            switch (mode.type) {
                                case 'circle':
                                    return <circle {...commonProps} key={ref.id} cx={ref.cx} cy={ref.cy} r={6}>
                                        <title>{ref.text}</title>
                                    </circle>;
                                case 'rect':
                                    return <rect {...commonProps} key={ref.id} x={ref.x} y={ref.y} width={ref.width} height={ref.height} rx={5}>
                                        <title>{ref.text}</title>
                                    </rect>;
                            }
                        })}
                    </g>
                ))}
            </svg>
        </div>
    );
}