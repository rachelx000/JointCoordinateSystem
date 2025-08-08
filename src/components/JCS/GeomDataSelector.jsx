const geom_data_mode = [
    {
        id: "hyperSphere",
        title: "Hypersphere"
    },
    {
        id: "kleinSurface",
        title: "4D Klein Surface"
    },
    {
        id: "kleinBottle",
        title: "4D Klein Bottle"
    }
];

export default function GeomDataSelector({ geomMode, setGeomMode }) {
    function handleSelectGeomData(e) {
        setGeomMode(e.currentTarget.value);
    }

    return (
        <div id="geom-data-selector">
            <fieldset>
                <legend>Choose a parametric surface: </legend>
                { geom_data_mode.map(mode => (
                    <div key={mode.id}>
                        <input type="radio" id={mode.id} name={mode.id} value={mode.id}
                               onChange={ handleSelectGeomData } checked={mode.id === geomMode} />
                        <label htmlFor={mode.id}>{mode.title}</label>
                    </div>
                ))}
            </fieldset>
        </div>
    )
}