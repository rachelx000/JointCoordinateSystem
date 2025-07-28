import { visualization_data } from "../example-data.js";

export default function ExampleDataSelector({ onChangeExampleData }) {
    return (
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
    )
}