import { useState, useEffect } from "react";
import { visualization_data } from "./example-data.js";
import { get_varnames, reset_variable_selector } from "./JCS.js";

function VarSelector({ varnames, setVarnames, selectedIVs, toggleSelectedIV, selectedDV, toggleSelectedDV, setIfRender }) {
    const [draggedIndex, setDraggedIndex] = useState(null);

    function handleDrop(index) {
        if (draggedIndex !== null && draggedIndex !== index) {
            let newVarnames = [...varnames];
            let draggedElement = newVarnames.splice(draggedIndex, 1)[0];
            newVarnames.splice(index, 0, draggedElement);
            setVarnames(newVarnames);
        }
        setDraggedIndex(null);
    }

    function handleDragStart(e, index) {
        setDraggedIndex(index);
        let draggedComponent = e.currentTarget.parentElement.parentElement;
        let boundingBox = draggedComponent.getBoundingClientRect();

        let offsetX = e.clientX - boundingBox.left;
        let offsetY = e.clientY - boundingBox.left;
        e.dataTransfer.setDragImage(draggedComponent, offsetX, offsetY);
    }

    if ( varnames === null ) { return; }
    return (
        <div id="variable-selector">
            <div id="variable-selector-title">
                <div>
                    <p>Variables</p>
                </div>
                <div id="controller-title">
                    <p>IV</p>
                    <p>DV</p>
                </div>
            </div>
            <div id="variables">
                {varnames.map((varname, index) => (
                    <div key={ varname } id={ varname } className={ draggedIndex === index ? "variable-row dragged" : "variable-row"}
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={() => handleDrop(index)}>
                        <div className="variable-names">
                            <p>{ varname }</p>
                        </div>
                        <div className={ "variable-controllers" }>
                            <input id={ varname+"-IV-selector" } className="IV" type="checkbox" onClick={ () => toggleSelectedIV(varname) }
                                disabled={ !selectedIVs.includes(varname) && selectedIVs.length >= 4 || varname === selectedDV}/>
                            <input id={ varname+"-DV-selector" } className="DV" type="checkbox" onClick={ () => toggleSelectedDV(varname) }
                                disabled={ selectedDV !== null && varname !== selectedDV || selectedIVs.includes(varname) }/>
                            <img src="/assets/drag-and-drop.png" className="drag-and-drop-icons" draggable
                                onDragStart={(e) => handleDragStart(e, index)} />
                        </div>
                    </div>
                ))}
            </div>
            <img id="start-render-icon" src="/assets/start.png" title="Run Rendering"
                 onClick={ () => selectedIVs.length >= 4 && selectedDV !== null ? setIfRender(true) : undefined}
                 style={{opacity: selectedIVs.length >= 4 && selectedDV !== null ? 0.8 : 0.4}}/>
        </div>
    )
}

function DataSelector({ onChangeExampleData }) {
    return (
        <div id="data-selector">
            <div>
                <label htmlFor="example-data-selector">Choose an example data: </label>
                <select name="example-data-selector" id="example-data-selector" onChange={ onChangeExampleData }>
                    { visualization_data.map(dataGroup => (
                        <optgroup key={ dataGroup.name } label={ dataGroup.name }>
                            { dataGroup.datasets.map(dataset => (
                                <option key={ dataset.path } value={ dataGroup.basePath + dataset.path + dataGroup.filetype}>
                                    { dataset.title }</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>
            <div id="custom-data">
                <label htmlFor="data-upload">Upload a file <span style={{ fontWeight: '700' }}>(.csv only)</span>: </label>
                <input name="data-upload" id="data-upload" type="file" accept=".csv"/>
                <br/>
                <br/>
                <input type="submit" value="Submit"/>
                <span>  </span>
                <span id="error-message">Error</span>
            </div>
        </div>
    )
}

export default function JCSMenu( { selectedData, setSelectedDataPath, selectedIVs, setSelectedIVs, selectedDV, setSelectedDV, setIfRender } ) {
    const [varnames, setVarnames] = useState(null);
    const [filename, setFilename] = useState("");

    function handleSelectData(e) {
        setSelectedDataPath(e.target.value);
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
        if (selectedData !== null) {
            setSelectedIVs([]);
            setSelectedDV(null);
            let currVarnames = get_varnames( selectedData );
            setVarnames(currVarnames);
        }
        if (varnames !== null) {
            reset_variable_selector();
        }
    }, [selectedData]);

    useEffect(() => {
        updateSelectedIVOrder(selectedIVs);
        console.log("Current Varnames:", varnames)
    }, [varnames])

    useEffect(() => {
        console.log("Current Selected IVs:", selectedIVs)
    }, [selectedIVs])

    useEffect(() => {
        console.log("Current Selected DV:", selectedDV)
    }, [selectedDV])

    return (
        <div id="control-panel" className="joint-coordinate-system">
            <DataSelector onChangeExampleData={ handleSelectData } />
            <VarSelector varnames={ varnames } setVarnames={ setVarnames }
                         selectedIVs={ selectedIVs } toggleSelectedIV={ toggleSelectedIV }
                         selectedDV={ selectedDV } toggleSelectedDV={ toggleSelectedDV }
                         setIfRender={ setIfRender } />
        </div>
    );
}