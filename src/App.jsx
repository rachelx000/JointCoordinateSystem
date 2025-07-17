import { useState, useEffect } from 'react';
import './css/App.css';
import NavBar from "./components/Navbar.jsx";
import JCS from "./components/JCS.jsx";
import AnalysisPanel from "./components/AnalysisPanel.jsx";

export default function App() {
    const [mode, setMode] = useState('data');
    const [selectedDataPath, setSelectedDataPath] = useState("/data/visualization_data/example/basic_elements.csv");
    const [nowPolygonData, setPolygonData] = useState(null);
    const [nowOrigin, setOrigin] = useState(null);
    const [onShowCentroids, setShowCentroids] = useState(false);

    function handleSelectData(e) {
        setSelectedDataPath(e.target.value);
    }

    useEffect(() => {
        console.log("Current selected data path: ", selectedDataPath);
    }, [selectedDataPath])

    useEffect(() => {
        console.log("Rendering mode changed to", mode);
    }, [mode]);

    useEffect(() => {
        console.log("Current Polygon Data: ", nowPolygonData);
    }, [nowPolygonData]);

    useEffect(() => {
        console.log("Current Origin: ", nowOrigin);
    }, [nowOrigin]);

    return (
        <>
            <NavBar nowMode={ mode } onChangeMode={ setMode }/>
            <main>
                <JCS nowDataPath={ selectedDataPath } nowPolygonData={ nowPolygonData }
                     handleSelectData={ handleSelectData } setPolygonData={ setPolygonData }
                     nowOrigin={ nowOrigin } setOrigin={ setOrigin }
                     onShowCentroids={ onShowCentroids } setShowCentroids={ setShowCentroids }/>
                <AnalysisPanel nowPolygonData={ nowPolygonData } nowOrigin={ nowOrigin }
                               onShowCentroids={ onShowCentroids }/>
            </main>
        </>
    );
}
