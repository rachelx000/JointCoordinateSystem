import { useState, useEffect } from 'react';
import JCSMenu from "./JCSMenu.jsx";
import JCSCanvas from "./JCSCanvas.jsx";
import '../css/JCS.css';
import { csv } from "d3";
import drawJCS, { resetJCS } from "./JCS.js";
import { generateGeomData } from "./GeometryVis.js";
import * as d3 from "d3";

// TODO: Add the effect of sliding block for the variable selector
// TODO: ALlow the user to download the JCS visualization result
// TODO: Change cursor to improve interactivity

let currSelectedIVs = [];
let currSelectedDV = null;
let currData = null;

export default function JCS({ size = 400, data, setData, mode, geomMode, setGeomMode, selectedIVs, setSelectedIVs,
                                selectedDV, setSelectedDV, ifRender, setIfRender, selectedColorScheme, setSelectedColorScheme,
                                nowPolygonData, setPolygonData, onOriginMode, setOriginMode, nowOrigin, setOrigin, onShowCentroids, handleShowCentroids,
                                onInspectMode, handleChangeInspectMode, onColorBlockMode, handleChangeColorBlockMode,
                                inspectedIndex, setInspectedIndex, setSidePanelRenderReady }) {
    const [exampleDataPath, setExampleDataPath] = useState(`${import.meta.env.BASE_URL}data/basics/ladder_pcp.csv`);
    const [uploadedData, setUploadedData] = useState(null);
    const [onShowPCC, setShowPCC] = useState(false);
    const [disableControl, setDisableControl] = useState(true);

    /* useEffect(() => {
        console.log("Disable Control:", disableControl);
    }, [disableControl]); */

    function reset() {
        currData = null;
        setPolygonData(null);
        setShowPCC(false);
        handleShowCentroids(false);
        handleChangeInspectMode(false);
        setInspectedIndex(null);
        setOriginMode(false);
        setOrigin(null);
        handleChangeColorBlockMode(false);
        setDisableControl(true);
        setSidePanelRenderReady(false);
        d3.select('#joint-coordinate-canvas').on('mousemove', null);
    }

    function handleSelectColorScheme(scheme_color_list) {
        setSelectedColorScheme(scheme_color_list);
    }

    function handleSelectColorGradient(e) {
        e.stopPropagation();
        setSelectedColorScheme([...selectedColorScheme].reverse());
    }

    function handleChangeOriginMode() {
        if (onOriginMode) {
            setOrigin(null);
        }
        setOriginMode(!onOriginMode);
    }

    useEffect(() => {
        resetJCS();
        setUploadedData(null);
        setExampleDataPath(`${import.meta.env.BASE_URL}data/basics/ladder_pcp.csv`);
    }, [mode]);

    useEffect(() => {
        reset();
        if (mode === "data") {
            if (exampleDataPath !== null && uploadedData === null) {
                csv(exampleDataPath).then(data => {
                    // Parse all data to float
                    let parsed_data = data.map(entry => {
                        const parsed_entry = {};
                        for (let key in entry) {
                            const val = entry[key];
                            const parsed_val = parseFloat(val);
                            parsed_entry[key] = isNaN(parsed_val) ? val : parsed_val;
                        }
                        return parsed_entry;
                    });
                    setData(parsed_data);
                }).catch(error => console.error(error));
                // console.log("Current selected data path: ", exampleDataPath)
            }
            if (uploadedData !== null) {
                setData(uploadedData);
            }
        }
        if (mode === "geom") {
            setData(generateGeomData(geomMode));
        }
    }, [mode, geomMode, exampleDataPath, uploadedData]);

    useEffect(() => {
        if (ifRender && data !== null) {
            currData = data;
            setInspectedIndex(null);
            currSelectedIVs = selectedIVs;
            currSelectedDV = selectedDV;
            setIfRender(false);
            setDisableControl(false);
        }
        if (currData !== null) {
            drawJCS( currData, currSelectedIVs, currSelectedDV, nowPolygonData, setPolygonData, size, selectedColorScheme,
                    onShowPCC, onShowCentroids, onOriginMode, nowOrigin, setOrigin, onColorBlockMode, onInspectMode,
                    setInspectedIndex, inspectedIndex );
            setSidePanelRenderReady(true);
        }
    }, [ifRender, selectedColorScheme, onShowPCC, onShowCentroids, onOriginMode, onColorBlockMode, onInspectMode, inspectedIndex]);

    return (
        <>
            <div id="joint-coordinate-system">
                <JCSCanvas onShowPCC={ onShowPCC } setShowPCC={ setShowPCC }
                           onShowCentroids={ onShowCentroids } onClickShowCentroids={ handleShowCentroids }
                           onInspectMode={ onInspectMode } onClickInspectMode={ handleChangeInspectMode }
                           onOriginMode={ onOriginMode } onClickOriginMode={ handleChangeOriginMode }
                           onColorBlockMode={ onColorBlockMode } onClickColorBlockMode={ handleChangeColorBlockMode }
                           onChangeColorGradient={ handleSelectColorGradient } disableControl={ disableControl }
                           selectedColorScheme={ selectedColorScheme } onChangeColorScheme={ handleSelectColorScheme } />
                <JCSMenu mode={ mode } data={ data } geomMode={ geomMode } setGeomMode = { setGeomMode }
                         setExampleDataPath={ setExampleDataPath }
                         uploadedData={ uploadedData } setUploadedData={ setUploadedData }
                         selectedIVs={ selectedIVs } setSelectedIVs={ setSelectedIVs }
                         selectedDV={ selectedDV } setSelectedDV={ setSelectedDV } setIfRender={ setIfRender }
                         setSidePanelRenderReady={ setSidePanelRenderReady }/>
            </div>
        </>
    )
}