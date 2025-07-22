import { useState, useEffect } from 'react';
import JCSMenu from "./JCSMenu.jsx";
import JCSCanvas from "./JCSCanvas.jsx";
import '../css/JCS.css';
import { csv } from "d3";
import drawJCS from "./JCS.js";

export default function JCS({ size = 400, nowDataPath, nowPolygonData, handleSelectData, setPolygonData,
                              nowOrigin, setOrigin, onShowCentroids, handleShowCentroids, onInspectMode, handleChangeInspectMode,
                              onColorBlockMode, handleChangeColorBlockMode, inspectedIndex, setInspectedIndex}) {
    const [selectedColorScheme, setSelectedColorScheme] = useState(['Blue', 'Red']);
    const [selectedColorGradient, setSelectedColorGradient] = useState("AB");
    const [onShowPCC, setShowPCC] = useState(false);
    const [onOriginMode, setOriginMode] = useState(false);

    function handleSelectColorScheme(e) {
        let colorSchemeList = e.target.value.split(",");
        setSelectedColorScheme(colorSchemeList);
        // console.log("Current selected color scheme: ", colorSchemeList);
    }

    function handleSelectColorGradient(e) {
        if (e.target.value !== selectedColorGradient) {
            setSelectedColorGradient(e.target.value);
            setSelectedColorScheme([...selectedColorScheme].reverse());
            // console.log("Current selected color scheme: ", e.target.value);
        }
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
            drawJCS( data, nowPolygonData, setPolygonData, size, selectedColorScheme, onShowPCC, onShowCentroids,
                onOriginMode, nowOrigin, setOrigin, onColorBlockMode, onInspectMode, setInspectedIndex, inspectedIndex );
        }).catch(error => console.error(error));
    }, [nowDataPath, selectedColorScheme, onShowPCC, onShowCentroids, onOriginMode, onColorBlockMode, onInspectMode, inspectedIndex]);

    return (
        <>
            <div id="joint-coordinate-system">
                <JCSCanvas />
                <JCSMenu onChangeData={ handleSelectData }
                         onChangeColorScheme={ handleSelectColorScheme }
                         onChangeColorGradient={ handleSelectColorGradient }
                         onClickShowPCC = { handleShowPCC }
                         onClickShowCentroids = { handleShowCentroids }
                         onShowCentroids={ onShowCentroids }
                         onClickOriginMode = { handleChangeOriginMode }
                         onClickInspectMode = { handleChangeInspectMode }
                         onInspectMode={ onInspectMode }
                         onClickColorBlockMode = { handleChangeColorBlockMode } />
            </div>
        </>
    )
}