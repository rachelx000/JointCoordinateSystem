import '../css/Navbar.css';

const navItems = [  // Four rendering modes
    {
        text: 'Data Analysis',
        mode: 'data'
    },
    {
        text: 'Geometry Vis',
        mode: 'geom'
    },
    {
        text: 'Comparison',
        mode: 'compare'
    },
    {
        text: 'Instruction',
        mode: 'instruct'
    }
];

export default function NavBar({ nowMode, onChangeMode }) {
    return (
        <>
            <nav>
                <img src="/favicons/favicon_white.png" width="100px" height="100px" alt="JCS icon"/>
                <h1>Joint Coordinate System</h1>
                <ul>
                    {navItems.map(item => (
                        <li key={item.mode} className={ (item.mode === nowMode) ? 'active' : '' }
                            onClick = {() => onChangeMode(item.mode)}>{item.text}</li>
                    ))}
                </ul>
            </nav>
        </>
    );
}