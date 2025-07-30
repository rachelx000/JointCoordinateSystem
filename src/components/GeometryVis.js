import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

// TODO: Make num_slice and num_stack adjustable by the user

const num_slice = 10, num_stack = 10;

export function coneParamFunction( u, v, target ) {
    let v_prime = v * 2 * Math.PI;            // range(v) = [0, 2PI]
    let u_prime = u * 2;                      // range(u) = [0, 2]

    let x = u_prime * Math.cos(v_prime);
    let y = u_prime;
    let z = u_prime * Math.sin(v_prime);

    target.set(x, y, z);
}

function generate_cone_surface_data( num_slice, num_stack ) {
    /*
        This creates a point cloud dataset for a cone opening along the y-axis:
            x(u, v) = u*cos(v),
            y(u, v) = u,
            z(u, v) = u*sin(v)
     */
    let data = [];
    let u, v, x, y, z;
    for (let i = 0; i <= num_stack; i++) {
        u = i / num_stack * 2;                // range(u) = [0, 2]
        for (let j = 0; j <= num_slice; j++) {
            v = j / num_slice * 2 * Math.PI   // range(v) = [0, 2PI]
            x = u * Math.cos(v);
            y = u;
            z = u * Math.sin(v);
            data.push({
                "u": u,
                "v": v,
                "[x] u*cos(v)": x,
                "[y] u": y,
                "[z] u*sin(v)": z
            })
        }
    }
    return data;
}

export function helixParamFunction( u, v, target ) {
    let v_prime = v * 2 * Math.PI;            // range(v) = [0, 2PI]
    let u_prime = u * 2;                      // range(u) = [0, 2]

    let x = u_prime * Math.cos(v_prime);
    let y = 0.5*v_prime;
    let z = u_prime * Math.sin(v_prime);

    target.set(x, y, z);
}

function generate_helix_surface_data( num_slice, num_stack ) {
    /*
        This creates a point cloud dataset for a helix along the y-axis:
            x(u, v) = u*cos(v),
            y(u, v) = v,
            z(u, v) = u*sin(v)
     */
    let data = [];
    let u, v, x, y, z;
    for (let i = 0; i <= num_stack; i++) {
        u = i / num_stack * 2;                // range(u) = [0, 2]
        for (let j = 0; j <= num_slice; j++) {
            v = j / num_slice * 2 * Math.PI   // range(v) = [0, 2PI]
            x = u * Math.cos(v);
            y = 0.5 * v;
            z = u * Math.sin(v);
            data.push({
                "u": u,
                "v": v,
                "[x] u*cos(v)": x,
                "[y] 0.5*v": y,
                "[z] u*sin(v)": z
            })
        }
    }
    return data;
}

export function torusParamFunction( u, v, target ) {
    let R = 1.5, r = 0.5;

    let v_prime = v * 2 * Math.PI;              // range(v) = [0, 2PI]
    let u_prime = u * 2 * Math.PI;              // range(u) = [0, 2PI]

    let x = (R + r * Math.cos(v_prime)) * Math.cos(u_prime);
    let y = (R + r * Math.cos(v_prime)) * Math.sin(u_prime);
    let z = r * Math.sin(v_prime);

    target.set(x, y, z);
}

function generate_torus_surface_data( num_slice, num_stack ) {
    /*
        This creates a point cloud dataset for a torus:
            x(u, v) = (1.5+0.5*cos(v))*cos(u),
            y(u, v) = (1.5+0.5*cos(v))*sin(u),
            z(u, v) = 0.5*sin(v)
     */
    let R = 1.5, r = 0.5;
    let data = [];
    let u, v, x, y, z;
    for (let i = 0; i <= num_stack; i++) {
        u = i / num_stack * 2 * Math.PI;
        for (let j = 0; j <= num_slice; j++) {
            v = j / num_slice * 2 * Math.PI
            let x = (R + r * Math.cos(v)) * Math.cos(u);
            let y = (R + r * Math.cos(v)) * Math.sin(u);
            const z = r * Math.sin(v);
            data.push({
                "u": u,
                "v": v,
                "[x] (1.5+0.5*cos(v))*cos(u)": x,
                "[y] (1.5+0.5*cos(v))*sin(u)": y,
                "[z] 0.5*sin(v)": z
            })
        }
    }
    return data;
}

export function cylinderParamFunction( u, v, target ) {
    let v_prime = v * 2 * Math.PI;              // range(v) = [0, 2PI]
    let u_prime = u * 2;                        // range(u) = [0, 2]

    let x = Math.cos(v_prime);
    let y = u_prime;
    let z = Math.sin(v_prime);

    target.set(x, y, z);
}

function generate_cylinder_surface_data( num_slice, num_stack ) {
    /*
        This creates a point cloud dataset for a cylinder along the y:
            x(u, v) = cos(v),
            y(u, v) = u,
            z(u, v) = sin(v)
     */
    let data = [];
    let u, v, x, y, z;
    for (let i = 0; i <= num_stack; i++) {
        u = i / num_stack * 2;
        for (let j = 0; j <= num_slice; j++) {
            v = j / num_slice * 2 * Math.PI;
            let x = Math.cos(v);
            let y = u;
            let z = Math.sin(v);
            data.push({
                "u": u,
                "v": v,
                "[x] cos(v)": x,
                "[y] u": y,
                "[z] sin(v)": z
            })
        }
    }
    return data;
}

export function ellipticParaParamFunction( u, v, target ) {
    let v_prime = v * 2 * Math.PI;              // range(v) = [0, 2PI]
    let u_prime = u * 1.5;                      // range(u) = [0, 1.5]

    let x = u_prime * Math.cos(v_prime);
    let y = u_prime * u_prime;
    let z = u_prime * Math.sin(v_prime);

    target.set(x, y, z);
}

function generate_elliptic_paraboloid_surface_data( num_slice, num_stack ) {
    /*
        This creates a point cloud dataset for a elliptic paraboloid along the y:
            x(u, v) = u*cos(v),
            y(u, v) = u*u,
            z(u, v) = u*sin(v)
     */
    let data = [];
    let u, v, x, y, z;
    for (let i = 0; i <= num_stack; i++) {
        u = i / num_stack * 1.5;
        for (let j = 0; j <= num_slice; j++) {
            v = j / num_slice * 2 * Math.PI;
            let x = u*Math.cos(v);
            let y = u*u;
            let z = u*Math.sin(v);
            data.push({
                "u": u,
                "v": v,
                "[x] u*cos(v)": x,
                "[y] u*u": y,
                "[z] u*sin(v)": z
            })
        }
    }
    return data;
}

export function hyperbolicParaParamFunction( u, v, target ) {
    let v_prime = v * 2 * Math.PI;              // range(v) = [0, 2PI]
    let u_prime = u * 0.8;                      // range(u) = [0, 1.5]

    let x = u_prime * (1 / Math.cos(v_prime));
    let y = u_prime * u_prime;
    let z = u_prime * Math.tan(v_prime);

    target.set(x, y, z);
}

function generate_hyperbolic_paraboloid_surface_data( num_slice, num_stack ) {
    /*
        This creates a point cloud dataset for a hyperbolic paraboloid along the y:
            x(u, v) = u*sec(v),
            y(u, v) = u*u,
            z(u, v) = u*tan(v)
     */
    let data = [];
    let u, v, x, y, z;
    for (let i = 0; i <= num_stack; i++) {
        u = i / num_stack * 0.8;
        for (let j = 0; j <= num_slice; j++) {
            v = j / num_slice * 2 * Math.PI;
            let x = u*(1 / Math.cos(v));
            let y = u*u;
            let z = u*Math.tan(v);
            data.push({
                "u": u,
                "v": v,
                "[x] u*cos(v)": x,
                "[y] u*u": y,
                "[z] u*sin(v)": z
            })
        }
    }
    return data;
}

export function generateGeomData( mode ) {
    switch (mode) {
        case "cylinder":
            return generate_cylinder_surface_data( num_slice, num_stack );
        case "cone":
            return generate_cone_surface_data( num_slice, num_stack );
        case "helix":
            return generate_helix_surface_data( num_slice, num_stack );
        case "torus":
            return generate_torus_surface_data( num_slice, num_stack );
        case "ellipticPara":
            return generate_elliptic_paraboloid_surface_data( num_slice, num_stack );
        case "hyperbolicPara":
            return generate_hyperbolic_paraboloid_surface_data( num_slice, num_stack );
        default:
            return;
    }
}

export function generateParamSurfaceMesh( param_function, polygon_data ) {
    // Create the mesh based on the parametric surface function
    let geometry = new ParametricGeometry(param_function, num_slice, num_stack);

    // Color the mesh based on the polygon data info
    let colors = [];
    const pos_info = geometry.attributes.position.array;
    const vertex_num = pos_info.length / 3;
    for (let i = 0; i < vertex_num; i++) {
        let color = new THREE.Color(polygon_data[i].color);
        colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.MeshLambertMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
    });
    let mesh = new THREE.Mesh(geometry, material)

    // Create wireframe mesh: generate lines only for the parametric grid
    let wireframe_positions = [];
    for (let i = 0; i <= num_stack; i++) {
        for (let j = 0; j <= num_slice; j++) {
            const u1 = i / num_stack;
            const v1 = j / num_slice;
            const u2 = (i + 1) / num_stack;
            const v2 = (j + 1) / num_slice;

            let p1 = new THREE.Vector3();
            let p2 = new THREE.Vector3();

            param_function(u1, v1, p1);

            // line segment along u-direction
            if (i < num_stack) {
                param_function(u2, v1, p2);
                wireframe_positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
            }

            // line segment along v-direction
            if (j < num_slice) {
                param_function(u1, v2, p2);
                wireframe_positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
            }
        }

    }
    let wireframe_line_geometry = new LineGeometry();
    wireframe_line_geometry.setPositions(wireframe_positions);

    const wireframe_material = new LineMaterial({
        color: 0xffffff,
        linewidth: 1.0,
        transparent: true,
        opacity: 0.5,
        depthTest: false,
    });
    wireframe_material.resolution.set(window.innerWidth, window.innerHeight);
    let wireframe_mesh = new LineSegments2(wireframe_line_geometry, wireframe_material);

    return { mesh: mesh, wireframe: wireframe_mesh };
}

export function initializeRender( container ) {
    // Remove previous generated canvas if exists
    container.querySelectorAll('canvas').forEach(canvas => {
        container.removeChild(canvas);
    });

    const width = container.clientWidth, height = container.clientHeight;

    // Initialize scene, camera and renderer
    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1b18);

    let camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
    );
    camera.position.set(3.5, 3.5, 3.5);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);        // Prevent blurring on HiDPI displays
    container.appendChild(renderer.domElement);

    // Set up the lighting
    const ambientlight = new THREE.AmbientLight( 'white', 5 );
    scene.add(ambientlight);
    const directLight = new THREE.DirectionalLight('white', 1);
    directLight.position.set(5, 8, 5);
    scene.add(directLight);

    // Set up camera controls
    let controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.minDistance = 2;
    controls.maxDistance = 20;

    // Add axes
    const axes = new THREE.AxesHelper(3.5); // 2 = axis length
    scene.add(axes);

    // Add axis labels
    const loader = new FontLoader();
    let label_meshes = [];
    loader.load('/fonts/Roboto_Regular.typeface.json', function (font) {
        function generate_axis_label(text, color, pos, face_pos) {
            const shapes = font.generateShapes(text, 0.2);
            const geometry = new THREE.ShapeGeometry(shapes);
            const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
            const label_mesh = new THREE.Mesh(geometry, material);
            label_mesh.position.set(...pos);
            label_mesh.lookAt(camera.position);
            label_meshes.push(label_mesh);
            scene.add(label_mesh);
        }

        generate_axis_label('X', "red", [3.6, 0, 0]);
        generate_axis_label('Y', "green", [0, 3.6, 0]);
        generate_axis_label('Z', "blue", [0, 0, 3.6]);
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
        label_meshes.forEach(label_mesh => label_mesh.lookAt(camera.position));
    };

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    return [ scene, camera, renderer, controls, animate ];
}