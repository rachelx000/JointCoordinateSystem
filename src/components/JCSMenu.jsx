import { visualization_data } from "./example-data.js";

const defaultColorSchemes = [
    {
        name: 'Cool-Warm',
        colors: 'Blue,Red'
    },
    {
        name: 'Isoluminant',
        colors: 'Green,Red'
    },
    {
        name: 'Blue-Yellow',
        colors: 'Navy,Gold'
    },
    {
        name: 'Greyscale',
        colors: 'Black,#DCDCDC'
    },
    {
        name: 'Heated-Body',
        colors: 'Black,Red,Yellow'
    },
    {
        name: 'Rainbow',
        colors: 'Blue,Cyan,Lime,Yellow,Red'
    }
];

export default function JCSMenu( { onChangeData, onChangeColorScheme, onChangeColorGradient, onClickShowPCC,
                                   onClickShowCentroids, onShowCentroids, onClickOriginMode, onClickInspectMode,
                                   onClickColorBlockMode } ) {
    return (
        <div id="control-panel" className="joint-coordinate-system">
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
            <br />

            {/* Drop-down list for selecting different scheme */}
            <label htmlFor="color-scheme">Choose a scheme (colorA, colorB):</label>
            <select name="color-scheme" id="color-scheme" onChange={ onChangeColorScheme }>
                { defaultColorSchemes.map(colorScheme => (
                    <option key={ colorScheme.name } value={ colorScheme.colors }>{ colorScheme.name }</option>
                ))}
            </select>

            {/* Drop-down list for selecting color gradient */}
            {/* TODO: Make it responsive for the color scheme selection */}
            <label htmlFor="color-gradient">Choose a color gradient:</label>
            <select name="color-gradient" id="color-gradient" onChange={ onChangeColorGradient }>
                <option value="AB">min -&gt; max</option>
                <option value="BA">max -&gt; min</option>
            </select>
            <form>
                {/* Checkbox for displaying the correlation indication */}
                <input type="checkbox" id="correlation-display" name="correlation-display" onChange={ onClickShowPCC } />
                <label htmlFor="correlation-display">Show Correlation (Blue-Negative, Red-Positive)</label>
                {/* Checkbox for displaying the centroids */}
                <input type="checkbox" id="centroid-display" name="centroid-display" onChange={ onClickShowCentroids }/>
                <label htmlFor="centroid-display">Show Centroids</label>
                <br />
                {/* Checkbox for origin mode */}
                <input type="checkbox" id="origin-mode" name="origin-mode" onChange={ onClickOriginMode } />
                <label htmlFor="origin-mode">Origin mode</label>
                {/* Checkbox for displaying polygons as color blocks */}
                <input type="checkbox" id="color-block-mode" name="color-block-mode" onChange={ onClickColorBlockMode } />
                <label htmlFor="color-block-mode">Color Block Mode</label>
                {/* Checkbox for close inspection */}
                <input type="checkbox" id="inspection-mode" name="inspection-mode" disabled={ !onShowCentroids } onChange={ onClickInspectMode }/>
                <label htmlFor="inspection-mode">Inspection mode</label>
            </form>
        </div>
    )
}