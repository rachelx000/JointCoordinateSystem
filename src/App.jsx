import { useState, useEffect } from 'react';
import './css/App.css';
import NavBar from "./components/Navbar.jsx";
import JCS from "./components/JCS.jsx";
import AnalysisPanel from "./components/AnalysisPanel.jsx";

export default function App() {
    const [mode, setMode] = useState('data');  // three rendering modes: 'data', 'geom', 'instruct'
    const [selectedDataPath, setSelectedDataPath] = useState("/data/visualization_data/example/basic_elements.csv");
    const [nowPolygonData, setPolygonData] = useState(null);

    useEffect(() => {
        console.log("Rendering mode changed to", mode);
    }, [mode]);

    function onChangeMode( nowMode ) {
        setMode(nowMode);
    }

    function handleSelectData(e) {
        setSelectedDataPath(e.target.value);
    }

    useEffect(() => {
        console.log("Current selected data path: ", selectedDataPath);
    }, [selectedDataPath])

    useEffect(() => {
        console.log("Current Polygon Data: ", nowPolygonData);
    }, [nowPolygonData]);

    return (
        <>
            <NavBar nowMode={ mode } onChangeMode={ onChangeMode }/>
            <main>
                <JCS nowDataPath={ selectedDataPath } nowPolygonData={ nowPolygonData }
                     handleSelectData={ handleSelectData } setPolygonData={ setPolygonData }/>
                <AnalysisPanel nowPolygonData={ nowPolygonData }/>
            </main>
        </>
    );
}
