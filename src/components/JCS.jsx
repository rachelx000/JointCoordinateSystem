import { useState, useEffect } from 'react';
import JCSMenu from "./JCSMenu.jsx";
import JCSCanvas from "./JCSCanvas.jsx";
import '../css/JCS.css';
import { csv } from "d3";
import drawJCS from "./JCS.js";

export default function JCS({ size = 400, nowDataPath, nowPolygonData, handleSelectData, setPolygonData,
                              nowOrigin, setOrigin, onShowCentroids, handleShowCentroids, onInspectMode, handleChangeInspectMode,
                              onColorBlockMode, handleChangeColorBlockMode, inspectedIndex, setInspectedIndex}) {
    const [selectedData, setSelectedData] = useState(null);
    const [selectedColorScheme, setSelectedColorScheme] = useState(['Blue', 'Red']);
    const [selectedColorGradient, setSelectedColorGradient] = useState("AB");
    const [onShowPCC, setShowPCC] = useState(false);
    const [onOriginMode, setOriginMode] = useState(false);

    function handleSelectColorScheme(scheme_color_list) {
        setSelectedColorScheme(scheme_color_list);
        console.log("Current selected color scheme: ", scheme_color_list);
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
        csv(nowDataPath).then(data => {
            setSelectedData(data);
        }).catch(error => console.error(error));
    }, [nowDataPath]);


    useEffect(() => {
        if ( selectedData !== null ) {
            drawJCS( selectedData, nowPolygonData, setPolygonData, size, selectedColorScheme, onShowPCC, onShowCentroids,
                onOriginMode, nowOrigin, setOrigin, onColorBlockMode, onInspectMode, setInspectedIndex, inspectedIndex );
        }
    }, [selectedData, selectedColorScheme, onShowPCC, onShowCentroids, onOriginMode, onColorBlockMode, onInspectMode, inspectedIndex]);

    return (
        <>
            <div id="joint-coordinate-system">
                <JCSCanvas onShowPCC={ onShowPCC } onClickShowPCC = { handleShowPCC }
                           onShowCentroids={ onShowCentroids } onClickShowCentroids = { handleShowCentroids }
                           onInspectMode={ onInspectMode } onClickInspectMode = { handleChangeInspectMode }
                           onOriginMode={ onOriginMode } onClickOriginMode = { handleChangeOriginMode }
                           onColorBlockMode={ onColorBlockMode } onClickColorBlockMode={ handleChangeColorBlockMode }
                           onChangeColorGradient={ handleSelectColorGradient }/>
                <JCSMenu selectedData={ selectedData } onChangeData={ handleSelectData }
                         selectedColorScheme={ selectedColorScheme } onChangeColorScheme={ handleSelectColorScheme } />
            </div>
        </>
    )
}