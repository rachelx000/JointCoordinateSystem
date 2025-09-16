import { useState, useEffect } from 'react';
import './css/App.css';
import NavBar from "./components/Navbar.jsx";
import JCS from "./components/JCS.jsx";
import AnalysisPanel from "./components/AnalysisPanel.jsx";
import GeometryVis from "./components/GeometryVis.jsx";
import ComparisonPanel from "./components/Comparison.jsx"
import DynamicJCS from "./components/DynamicJCS.jsx"

const sidePanelNavItems = {
    "data" : [
        {   text: 'Shape Analysis', mode: 'shape'   },
        {   text: 'Comparison', mode: 'compare'   },
        {   text: 'Dynamic JCS', mode: 'dynamic'   }
    ],
    "geom" : [
        {   text: 'Rendering', mode: 'render'   },
        {   text: 'Shape Analysis', mode: 'shape'   },
        {   text: 'Comparison', mode: 'compare'   },
        {   text: 'Dynamic JCS', mode: 'dynamic'   }
    ]
};

export default function App() {
    const [data, setData] = useState(null);
    const [mode, setMode] = useState('data');
    const [geomMode, setGeomMode] = useState({id: "hyperSphere", mode: "4D"});
    const [nowPolygonData, setPolygonData] = useState(null);
    const [onOriginMode, setOriginMode] = useState(false);
    const [nowOrigin, setOrigin] = useState(null);
    const [onShowCentroids, setShowCentroids] = useState(false);
    const [onInspectMode, setInspectMode] = useState(false);
    const [onColorBlockMode, setColorBlockMode] = useState(false);
    const [inspectedIndex, setInspectedIndex] = useState(null);
    const [sidePanelRenderReady, setSidePanelRenderReady] = useState(false);
    const [sidePanelMode, setSidePanelMode] = useState("shape");
    const [selectedIVs, setSelectedIVs] = useState([]);
    const [selectedDV, setSelectedDV] = useState(null);
    const [ifRender, setIfRender] = useState(false);
    const [selectedColorScheme, setSelectedColorScheme] = useState(['Blue', 'Red']);
    const [disableControl, setDisableControl] = useState(true);


    function handleChangeMode(selectedMode) {
        setMode(selectedMode);
        setPolygonData(null);
        if (selectedMode === 'data') {
            setSidePanelMode('shape');
        }
        if (selectedMode === 'geom') {
            setSidePanelMode('render');
        }
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

    /* useEffect(() => {
        console.log("Current geom mode changed to: ", geomMode);
    }, [geomMode]);

    useEffect(() => {
        console.log("Rendering mode changed to", mode);
    }, [mode]);



    useEffect(() => {
        console.log("Current index: ", inspectedIndex);
    }, [inspectedIndex]);

    useEffect(() => {
        console.log("Current Origin: ", nowOrigin);
    }, [nowOrigin]); */

    useEffect(() => {
        console.log("Current Polygon Data: ", nowPolygonData);
    }, [nowPolygonData]);

    function sidePanelSwitchMode( sidePanelMode ) {
        switch (sidePanelMode) {
            case 'shape':
                return <AnalysisPanel data={ data } selectedIVs={ selectedIVs } selectedDV={ selectedDV } nowPolygonData={ nowPolygonData }
                                      nowOrigin={ nowOrigin } onShowCentroids={ onShowCentroids }
                                      onColorBlockMode={ onColorBlockMode } onInspectMode={ onInspectMode }
                                      inspectedIndex={ inspectedIndex } setInspectedIndex={ setInspectedIndex }
                                      sidePanelRenderReady={ sidePanelRenderReady } disableControl={ disableControl }/>
            case 'compare':
                return <ComparisonPanel data={ data } nowPolygonData={ nowPolygonData } selectedIVs={ selectedIVs } selectedDV= { selectedDV }
                                        colorScheme={ selectedColorScheme } onColorBlockMode = { onColorBlockMode }
                                        onInspectMode={ onInspectMode } nowOrigin={ nowOrigin } onOriginMode={ onOriginMode }
                                        inspectedIndex={ inspectedIndex } setInspectedIndex={ setInspectedIndex }
                                        sidePanelRenderReady={ sidePanelRenderReady } disableControl={ disableControl }/>
            case 'render':
                return <GeometryVis data={ data } nowPolygonData={ nowPolygonData } geomMode={ geomMode }
                                    meshRenderReady={ sidePanelRenderReady } inspectedIndex={ inspectedIndex } />
            case 'dynamic':
                return <DynamicJCS nowPolygonData={ nowPolygonData } onColorBlockMode={ onColorBlockMode }
                                   sidePanelRenderReady={ sidePanelRenderReady } disableControl={ disableControl } />
        }
    }

    return (
        <>
            <NavBar nowMode={ mode } onChangeMode={ handleChangeMode }/>
            <main>
                <JCS data={ data } setData={ setData } mode={ mode } geomMode={ geomMode } setGeomMode = { setGeomMode }
                     selectedIVs={ selectedIVs } setSelectedIVs={ setSelectedIVs } selectedDV={ selectedDV }
                     setSelectedDV={ setSelectedDV } ifRender={ ifRender } setIfRender={ setIfRender }
                     selectedColorScheme={ selectedColorScheme } setSelectedColorScheme={ setSelectedColorScheme }
                     nowPolygonData={ nowPolygonData } setPolygonData={ setPolygonData }
                     onOriginMode={ onOriginMode } setOriginMode={ setOriginMode } nowOrigin={ nowOrigin } setOrigin={ setOrigin }
                     onShowCentroids={ onShowCentroids } handleShowCentroids={ handleShowCentroids }
                     onInspectMode={ onInspectMode } handleChangeInspectMode={ handleChangeInspectMode }
                     onColorBlockMode={ onColorBlockMode } handleChangeColorBlockMode={ handleChangeColorBlockMode }
                     inspectedIndex={ inspectedIndex } setInspectedIndex={ setInspectedIndex }
                     setSidePanelRenderReady={ setSidePanelRenderReady }
                     disableControl={ disableControl } setDisableControl={ setDisableControl }/>
                <div id="side-panel">
                    <div id="side-panel-navbar" className="no-text-select">
                        <ul>
                            {sidePanelNavItems[mode].map(item => (
                                <li key={item.mode} className={ (item.mode === sidePanelMode) ? 'active' : '' }
                                    onClick = {() => setSidePanelMode(item.mode)}>{item.text}</li>
                            ))}
                        </ul>
                    </div>
                    { sidePanelSwitchMode(sidePanelMode) }
                </div>
            </main>
        </>
    );
}
