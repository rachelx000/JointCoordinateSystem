import { useState, useEffect, useReducer } from "react";
import { visualization_data } from "./example-data.js";
import { isEqual } from "lodash";
import { get_varnames, reset_variable_selector } from "./JCS.js";

// TODO: Add custom color schemes (2, 3, 4, 5)

const defaultColorSchemes = [
    {
        name: 'Cool-Warm',
        colors: ['Blue', 'Red']
    },
    {
        name: 'Isoluminant',
        colors: ['Green', 'Red']
    },
    {
        name: 'Blue-Yellow',
        colors: ['Navy', 'Gold']
    },
    {
        name: 'Greyscale',
        colors: ['Black', '#DCDCDC']
    },
    {
        name: 'Heated-Body',
        colors: ['Black', 'Red', 'Yellow']
    },
    {
        name: 'Rainbow',
        colors: ['Blue', 'Cyan', 'Lime', 'Yellow', 'Red']
    }
];

function ColorSchemeSelector({selectedColorScheme, onChangeColorScheme }) {
    return (
        <div id="color-scheme-selector" onChange={ onChangeColorScheme }>
            { defaultColorSchemes.map(colorScheme => (
                <div key={ colorScheme.name } onClick={ () => onChangeColorScheme(colorScheme.colors) }
                     style={{ borderColor: (isEqual(colorScheme.colors, selectedColorScheme) ||
                             isEqual(colorScheme.colors.reverse(), selectedColorScheme)) ? '#090c9b' : '#fff' }}>
                    <h4>{ colorScheme.name }</h4>
                    {colorScheme.colors.map((color, index) => (
                        <div key={index} className="color-schemes" style={{ backgroundColor: color}} />
                    ))}
                </div>
            ))}
        </div>
    )
}

function VarSelector({ varnames, setVarnames, selectedIVs, toggleSelectedIV, selectedDV, toggleSelectedDV, setIfRender }) {
    const [draggedIndex, setDraggedIndex] = useState(null);

    function handleDrop(index) {
        if (draggedIndex === null || draggedIndex === index) { return; }

        let newVarnames = [...varnames];
        let draggedElement = newVarnames.splice(draggedIndex, 1)[0];
        newVarnames.splice(index, 0, draggedElement);
        setVarnames(newVarnames);
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
            <div>
                <div id="variable-title">
                    <p>Variables</p>
                </div>
                <div id="controller-title">
                    <p>IV</p>
                    <p>DV</p>
                </div>
            </div>
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
            <img id="start-render-icon" src="/assets/start.png" title="Run Rendering"
                 onClick={ () => selectedIVs.length >= 4 && selectedDV !== null ? setIfRender(true) : undefined}
                 style={{opacity: selectedIVs.length >= 4 && selectedDV !== null ? 0.8 : 0.4}}/>
        </div>
    )
}

export default function JCSMenu( { selectedData, onChangeData, selectedColorScheme, onChangeColorScheme,
                                   selectedIVs, setSelectedIVs, selectedDV, setSelectedDV, setIfRender } ) {
    const [varnames, setVarnames] = useState(null);

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
            let now_varnames = get_varnames( selectedData );
            console.log(now_varnames);
            setVarnames(now_varnames);
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
            <ColorSchemeSelector selectedColorScheme={ selectedColorScheme } onChangeColorScheme={ onChangeColorScheme } />
            <div id="data-control">
                {/* Drop-down list for selecting different example datasets */}
                <div id="example-data-selector">
                    <label htmlFor="example-data">Choose a example data:</label>
                    <select name="example-data" id="example-data" onChange={ onChangeData }>
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
                <VarSelector varnames={ varnames } setVarnames={ setVarnames }
                             selectedIVs={ selectedIVs } toggleSelectedIV={ toggleSelectedIV }
                             selectedDV={ selectedDV } toggleSelectedDV={ toggleSelectedDV }
                             setIfRender={ setIfRender }/>
            </div>
        </div>
    );
}