import { useState, useEffect } from 'react';
import './css/App.css';
import './components/Navbar.jsx';
import NavBar from "./components/Navbar.jsx";
import JCS from "./components/JCS.jsx";
import ShapeAnalysis from "./components/ShapeAnalysis.jsx";

function App() {
    const [mode, setMode] = useState('data')  // three rendering modes: 'data', 'geom', 'instruct'

    useEffect(() => {
        console.log("Rendering mode changed to", mode);
    }, [mode]);

    function onChangeMode( nowMode ) {
        setMode(nowMode);
    }

    return (
        <>
            <NavBar nowMode={ mode } onChangeMode={ onChangeMode }/>
            <main>
                <JCS />
                <ShapeAnalysis />
            </main>
        </>
    )
}

export default App
