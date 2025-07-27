import { useState, useEffect } from 'react';
import JCSMenu from "./JCSMenu.jsx";
import JCSCanvas from "./JCSCanvas.jsx";
import '../css/JCS.css';
import { csv } from "d3";
import drawJCS from "./JCS.js";

// TODO: Add the effect of sliding block for the variable selector
let currSelectedIVs = [];
let currSelectedDV = null;
let currData = null;

export default function JCS({ size = 400, nowPolygonData, setPolygonData, nowOrigin, setOrigin, onShowCentroids,
                              handleShowCentroids, onInspectMode, handleChangeInspectMode, onColorBlockMode,
                              handleChangeColorBlockMode, inspectedIndex, setInspectedIndex}) {
    const [selectedData, setSelectedData] = useState(null);
    const [selectedDataPath, setSelectedDataPath] = useState("/data/visualization_data/example/basic_elements.csv");
    const [selectedColorScheme, setSelectedColorScheme] = useState(['Blue', 'Red']);
    const [selectedColorGradient, setSelectedColorGradient] = useState("AB");
    const [onShowPCC, setShowPCC] = useState(false);
    const [onOriginMode, setOriginMode] = useState(false);
    const [selectedIVs, setSelectedIVs] = useState([]);
    const [selectedDV, setSelectedDV] = useState(null);
    const [ifRender, setIfRender] = useState(false);

    function handleSelectColorScheme(scheme_color_list) {
        setSelectedColorScheme(scheme_color_list);
        // console.log("Current selected color scheme: ", scheme_color_list);
    }

    function handleSelectColorGradient() {
        if (selectedColorGradient === "AB") {
            setSelectedColorGradient("BA");
        } else {
            setSelectedColorGradient("AB");
        }
        setSelectedColorScheme([...selectedColorScheme].reverse());
    }

    function handleShowPCC() {
        setShowPCC(!onShowPCC);
    }

    function handleChangeOriginMode() {
        if (onOriginMode) {
            setOrigin(null);
        }
        setOriginMode(!onOriginMode);
    }

    useEffect(() => {
        csv(selectedDataPath).then(data => {
            setSelectedData(data);
        }).catch(error => console.error(error));
        console.log("Current selected data path: ", selectedDataPath)
    }, [selectedDataPath]);

    useEffect(() => {
        if (ifRender) {
            currData = selectedData;
            setInspectedIndex(null);
            currSelectedIVs = selectedIVs;
            currSelectedDV = selectedDV;
            setIfRender(false);
        }
        if (currData !== null) {
            drawJCS( currData, currSelectedIVs, currSelectedDV, nowPolygonData, setPolygonData, size, selectedColorScheme,
                    onShowPCC, onShowCentroids, onOriginMode, nowOrigin, setOrigin, onColorBlockMode, onInspectMode,
                    setInspectedIndex, inspectedIndex );
        }
    }, [ifRender, selectedColorScheme, onShowPCC, onShowCentroids, onOriginMode, onColorBlockMode, onInspectMode, inspectedIndex]);

    return (
        <>
            <div id="joint-coordinate-system">
                <JCSCanvas onShowPCC={ onShowPCC } onClickShowPCC = { handleShowPCC }
                           onShowCentroids={ onShowCentroids } onClickShowCentroids = { handleShowCentroids }
                           onInspectMode={ onInspectMode } onClickInspectMode = { handleChangeInspectMode }
                           onOriginMode={ onOriginMode } onClickOriginMode = { handleChangeOriginMode }
                           onColorBlockMode={ onColorBlockMode } onClickColorBlockMode={ handleChangeColorBlockMode }
                           onChangeColorGradient={ handleSelectColorGradient }
                           selectedColorScheme={ selectedColorScheme } onChangeColorScheme={ handleSelectColorScheme } />
                <JCSMenu selectedData={ selectedData } setSelectedDataPath={ setSelectedDataPath }
                         selectedIVs={ selectedIVs } setSelectedIVs={ setSelectedIVs }
                         selectedDV={ selectedDV } setSelectedDV={ setSelectedDV }
                         setIfRender={ setIfRender }/>
            </div>
        </>
    )
}