import { useEffect, useState, useRef } from "react";
import "../css/DynamicJCS.css"
import { nestingPolygons, plotNestedPolygons } from "./DynamicJCS.js";
import {save_as_png} from "./JCS.js";

export default function DynamicJCS({ nowPolygonData, onColorBlockMode, sidePanelRenderReady, disableControl }) {
    const [nestedPolygons, setNestedPolygons] = useState({});
    const [params, setParams] = useState({
        tightness: 1.0,
        safetyBufferPixels: 0.1,
        maxIterations: 20
    });
    const [stats, setStats] = useState({});
    const nestedPolygonsRef = useRef(null);

    function onUpdateTightness(e) {
        setParams(prevParams => ({
            ...prevParams,
            tightness: e.target.value
        }))
    }

    function onUpdateSaftyBuffer(e) {
        setParams(prevParams => ({
            ...prevParams,
            safetyBufferPixels: e.target.value
        }))
    }


    function onUpdateMaxIterations(e) {
        setParams(prevParams => ({
            ...prevParams,
            maxIterations: e.target.value
        }))
    }

    useEffect(() => {
        console.log("dynmiacJCS polygons: ", nowPolygonData);
    }, [nowPolygonData]);

    useEffect(() => {
        if ( sidePanelRenderReady && nowPolygonData !== null ) {
            let [nested_polygons, curr_stats] = nestingPolygons( nowPolygonData, params );
            setNestedPolygons(nested_polygons);
            setStats(curr_stats);
        } else {
            setNestedPolygons({});
            setStats({});
        }
    }, [nowPolygonData, sidePanelRenderReady, params]);

    useEffect(()=> {
        nestedPolygonsRef.current = plotNestedPolygons( nestedPolygons, onColorBlockMode );
    }, [nestedPolygons])

    useEffect(()=> {
        console.log(stats);
    }, [stats])

    useEffect(() => {
        if (nestedPolygonsRef.current.updateColorBlockMode) {
            nestedPolygonsRef.current.updateColorBlockMode( onColorBlockMode );
        }
    }, [onColorBlockMode]);

    return (
        <div id="dynamic-jcs">
            <div id="dynamic-jcs-container">
                <h3>Dynamic JCS</h3>
                <img id="save-dynamic-jcs-button" src={`${import.meta.env.BASE_URL}assets/save.png`}
                     style={{opacity: disableControl ? "0.4": "0.8"}}
                     onClick={ disableControl ? undefined : () => save_as_png("dynamic-jcs-canvas-container", "spider", 3) }
                     alt={"Save button"} title={"Save Dynamic JCS"}/>
                <div id="dynamic-jcs-canvas-container">
                    <svg id="dynamic-jcs-canvas"></svg>
                </div>
                <div id="dynamic-jcs-panel">
                    <div id="dynamic-jcs-control">
                        <div className="parameter">
                            <label>Tightness Factor (0.1 - 1.0): </label>
                            <input type="range" id="tightness" style={{width: "150px", height: '10px'}} min="0.1" max="1.0" step="0.05" value={params.tightness} onInput={onUpdateTightness} />
                        </div>
                        <div style={{ height: '1px', width: '100%' }} />
                        <div className="parameter">
                            <label>Safety Buffer (pixels): </label>
                            <input type="range" id="saftyBufferPixels" style={{width: "150px", height: '10px'}} min="0.1" max="10.0" step="0.05" value={params.safetyBufferPixels} onInput={onUpdateSaftyBuffer}/>
                        </div>
                        <div style={{ height: '1px', width: '100%' }} />
                        <div className="parameter">
                            <label>Max Iteration (5 - 50): </label>
                            <input type="range" id="maxIterations" style={{width: "150px", height: '10px'}} min="5" max="50" step="1" value={params.maxIterations} onInput={onUpdateMaxIterations}/>
                        </div>
                        <div style={{ height: '1px', width: '100%' }} />
                    </div>
                    <div id="dynamic-jcs-result" style={{fontFamily: "monospace", fontSize: "11px"}}>
                        {stats && Object.keys(stats).length > 0 && (
                            <div>
                                Total polygons: { nowPolygonData?.length }
                                <br />
                                Total iterations: { stats.totalIterations }
                                <br />
                                Processing time: { stats.processingTime.toFixed(2) }ms
                                <br />
                                Smallest scale: { Math.min(...stats.scaleFactors.filter(scale => scale > 0)) }
                                <br />
                                Min distance to edges: { stats.minDistance.toFixed(2) }px
                                <br />
                                Extremely small polygons: {stats.scaleFactors.filter(scale => scale === 0).length}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}