import '../css/Navbar.css';

// TODO: Add copyright footer

const navItems = [
    {   text: 'Data Analysis', mode: 'data'   },
    {   text: 'Geometry Vis', mode: 'geom'    },
    /*
    {   text: 'Instruction', mode: 'instruct' } */
];

export default function NavBar({ nowMode, onChangeMode }) {
    return (
        <>
            <nav className="no-text-select">
                <img src={`${import.meta.env.BASE_URL}favicons/favicon_white.png`} width="100px" height="100px" alt="JCS icon"/>
                <h1>Joint Coordinate System Dashboard</h1>
                <ul>
                    {navItems.map(item => (
                        <li key={item.mode} className={ (item.mode === nowMode) ? 'active' : '' }
                            onClick = {() => onChangeMode(item.mode)}>{item.text}</li>
                    ))}
                </ul>
                <div id="footer">
                    <a href="https://github.com/rachelx000/JointCoordinateSystem">
                        <img src={`${import.meta.env.BASE_URL}assets/github-mark-white.svg`} width="20px" height="20px" alt="Github" />
                    </a>
                    <p>© 2025 Rachel Xing</p>
                </div>
            </nav>
        </>
    );
}