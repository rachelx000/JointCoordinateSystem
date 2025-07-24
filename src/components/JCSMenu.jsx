import { visualization_data } from "./example-data.js";
import { isEqual } from "lodash";

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

export default function JCSMenu( { onChangeData, selectedColorScheme, onChangeColorScheme } ) {
    return (
        <div id="control-panel" className="joint-coordinate-system">
            <div id="color-scheme-control">
                <div id="color-scheme" onChange={ onChangeColorScheme }>
                    { defaultColorSchemes.map(colorScheme => (
                        <div key={ colorScheme.name } onClick={ () => onChangeColorScheme(colorScheme.colors) }
                            style={{ border: (isEqual(colorScheme.colors, selectedColorScheme) ||
                                    isEqual(colorScheme.colors.reverse(), selectedColorScheme)) ? '2px solid #090c9b' : '2px solid #eaeaea' }}>
                            <h4>{ colorScheme.name }</h4>
                            {colorScheme.colors.map((color, index) => (
                                <div key={index} style={{ backgroundColor: color, width: 18, height: 18, borderRadius: '2px', margin: 0}} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div id="data-control">
                {/* Drop-down list for selecting different example datasets */}
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
        </div>
    );
}