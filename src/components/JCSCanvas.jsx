import { useState } from "react";
import { isEqual } from "lodash";
import { save_as_png } from "./JCS.js";

// TODO: Add custom color schemes (2, 3, 4, 5)

const defaultColorSchemes = [
    {
        name: 'Cool-Warm',
        colors: ['Blue', 'Red']
    },
    {
        name: 'Isoluminant',
        colors: ['Green', 'Red']
    },
    {
        name: 'Blue-Yellow',
        colors: ['Navy', 'Gold']
    },
    {
        name: 'Greyscale',
        colors: ['Black', '#DCDCDC']
    },
    {
        name: 'Heated-Body',
        colors: ['Black', 'Red', 'Yellow']
    },
    {
        name: 'Rainbow',
        colors: ['Blue', 'Cyan', 'Lime', 'Yellow', 'Red']
    }
];

function ColorSchemeMenu({ selectedColorScheme, onChangeColorScheme, onChangeColorGradient }) {
    return (
        <div id="color-scheme-menu" onChange={ onChangeColorScheme }>
            { defaultColorSchemes.map(colorScheme => (
                <div key={ colorScheme.name } onClick={ () => onChangeColorScheme(colorScheme.colors) }
                     style={{ borderColor: (isEqual(colorScheme.colors, selectedColorScheme) ||
                             isEqual(colorScheme.colors.reverse(), selectedColorScheme)) ? '#090c9b' : '#fff' }}>
                    <div id="color-scheme-blocks">
                        <h4>{ colorScheme.name }</h4>
                        {colorScheme.colors.map((color, index) => (
                            <div key={index} className="color-schemes" style={{ backgroundColor: color}} />
                        ))}
                    </div>
                    { (isEqual(colorScheme.colors, selectedColorScheme)) &&
                        <img id="color-gradient-button" src={`${import.meta.env.BASE_URL}assets/reverse.png`}
                             onClick={ onChangeColorGradient } alt={"Toggle Color Gradient Button"} title={"Toggle Color Gradient"}/> }
                </div>
            ))}
        </div>
    )
}

export default function JCSCanvas({ onShowPCC, setShowPCC, onShowCentroids, onClickShowCentroids,
                                    onInspectMode, onClickInspectMode, onOriginMode, onClickOriginMode,
                                    onColorBlockMode, onClickColorBlockMode, onChangeColorGradient, disableControl,
                                    selectedColorScheme, onChangeColorScheme }) {
    const [openColorSchemeMenu, setOpenColorSchemeMenu] = useState(false);
    return (
        <>
            <div id="joint-coordinate">
                {/* Color Scheme Menu */}
                <div onMouseEnter={() => setOpenColorSchemeMenu(true)}
                     onMouseLeave={() => setOpenColorSchemeMenu(false)}>
                    <img id="color-scheme-menu-icon" className={openColorSchemeMenu ? "rotate" : undefined}
                         src={`${import.meta.env.BASE_URL}assets/color-picker.png`} alt={"Change Color Scheme Menu"} title={"Change Color Scheme"}/>
                    {openColorSchemeMenu &&
                        <ColorSchemeMenu selectedColorScheme={ selectedColorScheme } onChangeColorScheme={ onChangeColorScheme } onChangeColorGradient={ onChangeColorGradient }/> }
                </div>
                {/* Controlling Buttons */}
                <img id="show-correlation-button" src={`${import.meta.env.BASE_URL}assets/correlation.png`} onClick={ disableControl ? undefined : (() => setShowPCC(!onShowPCC)) }
                     style={{opacity: onShowPCC ? "0.8": "0.4"}} alt={"Show correlation button"} title={"Show Correlations"} />
                <img id="show-centroid-button" src={`${import.meta.env.BASE_URL}assets/centroid.png`} onClick={ disableControl ? undefined : (() => onClickShowCentroids()) }
                     style={{opacity: onShowCentroids ? "0.8": "0.4"}}  alt={"Show centroid button"} title={"Show Centroids"}/>
                <img id="inspect-button" src={`${import.meta.env.BASE_URL}assets/inspect.png`} onClick={ onShowCentroids ? (() => onClickInspectMode()) : undefined }
                     style={{opacity: onShowCentroids ? (onInspectMode ? "0.8": "0.4") : "0.2"}} alt={"Toggle Inspection Button"} title={"Inspection Mode"}/>
                <img id="display-origin-button" src={`${import.meta.env.BASE_URL}assets/origin.png`} onClick={ disableControl ? undefined : onClickOriginMode }
                     style={{opacity: onOriginMode ? "0.8": "0.4"}} alt={"Toggle Origin Button"} title={"Origin Mode"}/>
                <img id="color-block-button" src={`${import.meta.env.BASE_URL}assets/color-block.png`} onClick={ disableControl ? undefined : (() => onClickColorBlockMode()) }
                     style={{opacity: onColorBlockMode ? "0.8": "0.4"}} alt={"Toggle Color Block Button"} title={"Color Block Mode"}/>
                <img id="save-JCS-button" src={`${import.meta.env.BASE_URL}assets/save.png`} onClick={ disableControl ? undefined : (() => save_as_png("joint-coordinate-container", "jcs", 2.0)) }
                     style={{opacity: disableControl ? "0.4": "0.8"}} alt={"Save Button"} title={"Save JCS Plot"}/>
                <h3>Joint Coordinate</h3>
                <div id="joint-coordinate-container">
                    <svg id="joint-coordinate-canvas">
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
                                <text id="left-axis-title" className="axis-title" dominantBaseline="middle"/>
                            </g>
                            <g id="top-axis">
                                <text id="top-axis-title" className="axis-title" textAnchor="middle"/>
                            </g>
                            <g id="right-axis">
                                <text id="right-axis-title" className="axis-title" dominantBaseline="middle"/>
                            </g>
                            <g id="bottom-axis">
                                <text id="bottom-axis-title" className="axis-title" textAnchor="middle"/>
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
                        <g id="data-tooltip">
                            <rect />
                            <polygon />
                            <text id="data-tooltip-text" />
                        </g>
                    </svg>
                    {/* Colorscale */}
                    <svg id="colorscale">
                        <g id="colorscale-content" />
                        <g id="colorscale-axis">
                            <text className="axis-title" />
                        </g>
                    </svg>
                </div>
            </div>
        </>
    );
}