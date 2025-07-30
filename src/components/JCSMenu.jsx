import { useState, useEffect } from "react";
import { get_varnames, reset_variable_selector } from "./JCS.js";
import VarSelector from "./JCS/VariableSelector.jsx";
import ExampleDataSelector from "./JCS/ExampleDataSelector.jsx";
import UploadFileHandler from "./JCS/UploadFileHandler.jsx";
import GeomDataSelector from "./JCS/GeomDataSelector.jsx";


export default function JCSMenu( { mode, data, geomMode, setGeomMode, setExampleDataPath, setUploadedData,
                                     selectedIVs, setSelectedIVs, selectedDV, setSelectedDV, setIfRender } ) {
    const [varnames, setVarnames] = useState(null);

    function handleSelectData(e) {
        setExampleDataPath(e.target.value);
        setUploadedData(null);
    }

    function updateSelectedIVOrder(currSelectedIVs) {
        let updatedSelectedIVs = [...currSelectedIVs];
        updatedSelectedIVs.sort((a, b) => varnames.indexOf(a) - varnames.indexOf(b));
        setSelectedIVs(updatedSelectedIVs);
    }

    function toggleSelectedIV(target_var) {
        if (selectedIVs.includes(target_var)) {
            setSelectedIVs(selectedIVs.filter((ind_var) => ind_var !== target_var));
        } else {
            updateSelectedIVOrder([...selectedIVs, target_var]);
        }
    }

    function toggleSelectedDV(target_var) {
        if (selectedDV === null) {
            setSelectedDV(target_var);
        } else {
            setSelectedDV(null);
        }
    }

    useEffect(() => {
        if (data !== null) {
            setSelectedIVs([]);
            setSelectedDV(null);
            let currVarnames = get_varnames( data );
            setVarnames(currVarnames);
        }
        if (varnames !== null) {
            reset_variable_selector();
        }
    }, [data]);

    /* useEffect(() => {
        updateSelectedIVOrder(selectedIVs);
        console.log("Current Varnames:", varnames)
    }, [varnames])

    useEffect(() => {
        console.log("Current Selected IVs:", selectedIVs)
    }, [selectedIVs])

    useEffect(() => {
        console.log("Current Selected DV:", selectedDV)
    }, [selectedDV]) */

    return (
        <div id="control-panel" className="joint-coordinate-system">
            <div id="data-selector">
                { mode === "data" && (
                    <>
                        <ExampleDataSelector onChangeExampleData={ handleSelectData } />
                        <UploadFileHandler setUploadedData={ setUploadedData } />
                    </>)}
                { mode === "geom" && (
                    <>
                        <GeomDataSelector geomMode={ geomMode } setGeomMode={ setGeomMode }/>
                    </>
                )}
            </div>
            <VarSelector mode={ mode } varnames={ varnames } setVarnames={ setVarnames }
                         selectedIVs={ selectedIVs } toggleSelectedIV={ toggleSelectedIV }
                         selectedDV={ selectedDV } toggleSelectedDV={ toggleSelectedDV }
                         setIfRender={ setIfRender } />
        </div>
    );
}