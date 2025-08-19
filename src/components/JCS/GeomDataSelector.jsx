const geom_data_mode = [
    {
        id: "cylinder",
        class: "3D",
        title: "Cylinder Surface"
    },
    {
        id: "cone",
        class: "3D",
        title: "Cone Surface",
    },
    {
        id: "helix",
        class: "3D",
        title: "Helix Surface",
    },
    {
        id: "torus",
        class: "3D",
        title: "Torus",
    },
    {
        id: "ellipticPara",
        class: "3D",
        title: "Elliptic Paraboloid"
    },
    {
        id: "hyperbolicPara",
        class: "3D",
        title: "Hyperbolic Paraboloid"
    },
    {
        id: "hyperSphere",
        class: "4D",
        title: "Hypersphere"
    },
    {
        id: "torus4D",
        class: "4D",
        title: "4D Torus"
    },
    {
        id: "kleinSurface",
        class: "4D",
        title: "4D Klein Surface"
    },
    {
        id: "kleinBottle",
        class: "4D",
        title: "4D Klein Bottle"
    }
];

export default function GeomDataSelector({ geomMode, setGeomMode }) {
    function handleSelectGeomData(e) {
        setGeomMode(JSON.parse(e.currentTarget.value));
    }

    return (
        <div id="geom-data-selector">
            <fieldset>
                <legend>Choose a parametric surface: </legend>
                <div>
                    <strong>3D Surfaces:</strong>
                    { geom_data_mode.filter(mode => mode.class === "3D")
                        .map(mode => (
                            <div key={mode.id}>
                                <input type="radio" id={mode.id} name={mode.id} value={JSON.stringify({mode: mode.class, id: mode.id})}
                                       onChange={ handleSelectGeomData } checked={mode.id === geomMode.id} />
                                <label htmlFor={mode.id}>{mode.title}</label>
                            </div>
                        ))
                    }
                </div>
                <hr/>
                <div>
                    <strong>4D Surfaces:</strong>
                    { geom_data_mode.filter(mode => mode.class === "4D")
                        .map(mode => (
                            <div key={mode.id}>
                                <input type="radio" id={mode.id} name={mode.id} value={JSON.stringify({mode: mode.class, id: mode.id})}
                                       onChange={ handleSelectGeomData } checked={mode.id === geomMode.id} />
                                <label htmlFor={mode.id}>{mode.title}</label>
                            </div>
                        ))
                    }
                </div>
            </fieldset>
        </div>
    )
}