import { useState, useEffect } from 'react';
import './css/App.css';
import NavBar from "./components/Navbar.jsx";
import JCS from "./components/JCS.jsx";
import AnalysisPanel from "./components/AnalysisPanel.jsx";
import GeometryVis from "./components/GeometryVis.jsx";

export default function App() {
    const [mode, setMode] = useState('data');
    const [geomMode, setGeomMode] = useState("cone");
    const [nowPolygonData, setPolygonData] = useState(null);
    const [nowOrigin, setOrigin] = useState(null);
    const [onShowCentroids, setShowCentroids] = useState(false);
    const [onInspectMode, setInspectMode] = useState(false);
    const [onColorBlockMode, setColorBlockMode] = useState(false);
    const [inspectedIndex, setInspectedIndex] = useState(null);
    const [meshRenderingReady, setMeshRenderingReady] = useState(false);

    function handleChangeMode(selectedMode) {
        setMode(selectedMode);
        setPolygonData(null);
    }

    function handleShowCentroids( boolVal=null ) {
        if ( boolVal === null ) {
            if (onShowCentroids && onInspectMode) {
                setInspectMode(false);
            }
            setShowCentroids(!onShowCentroids);
        } else {
            setShowCentroids(boolVal);
        }
    }

    function handleChangeInspectMode( boolVal=null ) {
        if ( boolVal === null ) {
            if (onShowCentroids) {
                setInspectMode(!onInspectMode);
            } else {
                setInspectedIndex(null);
            }
        } else {
            setInspectMode(boolVal);
        }
    }

    function handleChangeColorBlockMode( boolVal=null ) {
        if ( boolVal === null ) {
            setColorBlockMode(!onColorBlockMode);
        } else {
            setColorBlockMode(boolVal);
        }
    }

    useEffect(() => {
        console.log("Current geom mode changed to: ", geomMode);
    }, [geomMode]);

    useEffect(() => {
        console.log("Rendering mode changed to", mode);
    }, [mode]);

    useEffect(() => {
        console.log("Current Polygon Data: ", nowPolygonData);
    }, [nowPolygonData]);

    useEffect(() => {
        console.log("Current index: ", inspectedIndex);
    }, [inspectedIndex]);

    /*useEffect(() => {
        console.log("Current Origin: ", nowOrigin);
    }, [nowOrigin]); */

    function switchMode( mode ) {
        switch (mode) {
            case 'data':
                return <AnalysisPanel nowPolygonData={ nowPolygonData }  nowOrigin={ nowOrigin } onShowCentroids={ onShowCentroids }
                                   onColorBlockMode={ onColorBlockMode } onInspectMode={ onInspectMode }
                                   inspectedIndex={ inspectedIndex } setInspectedIndex={ setInspectedIndex } />;
            case 'geom':
                return <GeometryVis nowPolygonData={ nowPolygonData } geomMode={ geomMode }
                                    meshRenderingReady={ meshRenderingReady } setMeshRenderingReady={ setMeshRenderingReady }/>;
            default:
                return;
        }
    }

    return (
        <>
            <NavBar nowMode={ mode } onChangeMode={ handleChangeMode }/>
            <main>
                <JCS mode={ mode } geomMode={ geomMode } setGeomMode = { setGeomMode }
                     nowPolygonData={ nowPolygonData } setPolygonData={ setPolygonData }
                     nowOrigin={ nowOrigin } setOrigin={ setOrigin }
                     onShowCentroids={ onShowCentroids } handleShowCentroids={ handleShowCentroids }
                     onInspectMode={ onInspectMode } handleChangeInspectMode={ handleChangeInspectMode }
                     onColorBlockMode={ onColorBlockMode } handleChangeColorBlockMode={ handleChangeColorBlockMode }
                     inspectedIndex={ inspectedIndex } setInspectedIndex={ setInspectedIndex }
                     setMeshRenderingReady={ setMeshRenderingReady }/>
                { switchMode( mode ) }
            </main>
        </>
    );
}
