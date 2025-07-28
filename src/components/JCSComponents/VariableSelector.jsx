import { useState } from "react";

// TODO: Allow user to adjust variable titles

export default function VarSelector({ varnames, setVarnames, selectedIVs, toggleSelectedIV, selectedDV, toggleSelectedDV, setIfRender }) {
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
