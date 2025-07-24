import { visualization_data } from "./example-data.js";
import { isEqual } from "lodash";
import { get_varnames } from "./JCS.js";

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

function VarSelector({ selectedData }) {
    if ( selectedData === null ) {
        return;
    }
    let varnames = get_varnames( selectedData );
    return (
        <div id="variable-selector">
            <div>
                <div id="variable-title">
                    <text>Variables</text>
                </div>
                <div id="controller-title">
                    <text>IV</text>
                    <text>DV</text>
                </div>
            </div>
            {varnames.map(varname => (
                <div key={ varname } id={ varname }>
                    <div className="variable-names">
                        <text>{ varname }</text>
                    </div>
                    <div className="variable-controllers">
                        <input type="checkbox" />
                        <input type="checkbox" />
                        <img src="/assets/drag-and-drop.png" className="drag-and-drop-icons"/>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function JCSMenu( { selectedData, onChangeData, selectedColorScheme, onChangeColorScheme } ) {
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
                                    <option key={ dataset.path } value={ dataGroup.basePath + dataset.path + dataGroup.filetype}>{ dataset.title }</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <VarSelector selectedData={ selectedData }/>
            </div>
        </div>
    );
}