import { useState, useEffect } from 'react';
import JCSMenu from "./JCSMenu.jsx";
import JCSCanvas from "./JCSCanvas.jsx";
import '../css/JCS.css';
import { csv } from "d3";
import drawJCS from "./JCS.draw.js";

export default function JCS({ size = 400 }) {

    const [selectedDataPath, setSelectedDataPath] = useState("/data/visualization_data/example/basic_elements.csv")
    const [selectedData, setSelectedData] = useState(null);
    const [selectedColorScheme, setSelectedColorScheme] = useState(['Blue', 'Red']);
    const [selectedColorGradient, setSelectedColorGradient] = useState("AB");
    const [onShowPCC, setShowPCC] = useState(false);
    const [onShowCentroids, setShowCentroids] = useState(false);
    const [onOriginMode, setOriginMode] = useState(false);
    const [onInspectMode, setInspectMode] = useState(false);
    const [onColorBlockMode, setColorBlockMode] = useState(false);
    const [inspectedIndex, setInspectedIndex] = useState(null);

    function handleSelectData(e) {
        setSelectedDataPath(e.target.value);
        // console.log("Current selected data path: ", e.target.value);
    }

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

    function handleShowCentroids() {
        setShowCentroids(!onShowCentroids);
    }

    function handleChangeOriginMode() {
        setOriginMode(!onOriginMode);
    }

    function handleChangeInspectMode() {
        if (onShowCentroids) {
            setInspectMode(!onInspectMode);
        } else {
            setInspectedIndex(null);
        }
    }

    function handleChangeColorBlockMode() {
        setColorBlockMode(!onColorBlockMode);
    }

    useEffect(() => {
        csv(selectedDataPath).then(data => {
            setSelectedData(data);
            drawJCS( data, size, selectedColorScheme, onShowPCC, onShowCentroids, onOriginMode, onColorBlockMode, onInspectMode, setInspectedIndex, inspectedIndex );
        }).catch(error => console.error(error));
    }, [selectedDataPath, selectedColorScheme, onShowPCC, onShowCentroids, onOriginMode, onColorBlockMode, onInspectMode, inspectedIndex]);

    /* useEffect(() => {
        console.log("Current Selected Data Index", inspectedIndex);
    }, [inspectedIndex]); */

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
                         onClickColorBlockMode = { handleChangeColorBlockMode } />
            </div>
        </>
    )
}