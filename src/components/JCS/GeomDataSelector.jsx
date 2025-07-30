const geom_data_mode = [
    {
        id: "cylinder",
        title: "Cylinder Surface",
    },
    {
        id: "cone",
        title: "Cone Surface",
    },
    {
        id: "helix",
        title: "Helix Surface",
    },
    {
        id: "torus",
        title: "Torus",
    },
    {
        id: "ellipticPara",
        title: "Elliptic Paraboloid"
    },
    {
        id: "hyperbolicPara",
        title: "Hyperbolic Paraboloid"
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