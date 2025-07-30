import { useState, useEffect } from 'react';
import JCSMenu from "./JCSMenu.jsx";
import JCSCanvas from "./JCSCanvas.jsx";
import '../css/JCS.css';
import { csv } from "d3";
import drawJCS from "./JCS.js";
import { generateGeomData } from "./GeometryVis.js";

// TODO: Add the effect of sliding block for the variable selector
// TODO: ALlow the user to download the JCS visualization result

let currSelectedIVs = [];
let currSelectedDV = null;
let currData = null;

export default function JCS({ mode, geomMode, setGeomMode, size = 400, nowPolygonData, setPolygonData, nowOrigin, setOrigin, onShowCentroids,
                              handleShowCentroids, onInspectMode, handleChangeInspectMode, onColorBlockMode,
                              handleChangeColorBlockMode, inspectedIndex, setInspectedIndex, setMeshRenderingReady}) {
    const [data, setData] = useState(null);
    const [exampleDataPath, setExampleDataPath] = useState("/data/visualization_data/example/basic_elements.csv");
    const [uploadedData, setUploadedData] = useState(null);
    const [selectedColorScheme, setSelectedColorScheme] = useState(['Blue', 'Red']);
    const [selectedColorGradient, setSelectedColorGradient] = useState("AB");
    const [onShowPCC, setShowPCC] = useState(false);
    const [onOriginMode, setOriginMode] = useState(false);
    const [selectedIVs, setSelectedIVs] = useState([]);
    const [selectedDV, setSelectedDV] = useState(null);
    const [ifRender, setIfRender] = useState(false);
    const [disableControl, setDisableControl] = useState(true);

    useEffect(() => {
        console.log("Disable Control:", disableControl);
    }, [disableControl]);

    function reset() {
        setShowPCC(false);
        handleShowCentroids(false);
        handleChangeInspectMode(false);
        setInspectedIndex(null);
        setOriginMode(false);
        handleChangeColorBlockMode(false);
        setDisableControl(true);
    }

    function handleSelectColorScheme(scheme_color_list) {
        setSelectedColorScheme(scheme_color_list);
    }

    function handleSelectColorGradient() {
        if (selectedColorGradient === "AB") {
            setSelectedColorGradient("BA");
        } else {
            setSelectedColorGradient("AB");
        }
        setSelectedColorScheme([...selectedColorScheme].reverse());
    }

    function handleChangeOriginMode() {
        if (onOriginMode) {
            setOrigin(null);
        }
        setOriginMode(!onOriginMode);
    }

    useEffect(() => {
        reset();
        if (mode === "data") {
            if (exampleDataPath !== null && uploadedData === null) {
                csv(exampleDataPath).then(data => {
                    setData(data);
                }).catch(error => console.error(error));
                console.log("Current selected data path: ", exampleDataPath)
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
            setMeshRenderingReady(true);
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
                         setExampleDataPath={ setExampleDataPath } setUploadedData={ setUploadedData }
                         selectedIVs={ selectedIVs } setSelectedIVs={ setSelectedIVs }
                         selectedDV={ selectedDV } setSelectedDV={ setSelectedDV }
                         setIfRender={ setIfRender } />
            </div>
        </>
    )
}