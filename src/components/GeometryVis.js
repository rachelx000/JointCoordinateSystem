import * as THREE from 'three';
import * as math from "mathjs";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineSegmentsGeometry } from "three/addons";

// TODO: Make resolution & projection params adjustable by the user

/* 3D Parametric Functions */
export function cylinderParamFunction( u, v, target ) {
    let v_prime = v * 2 * Math.PI;              // range(v) = [0, 2PI]
    let u_prime = u * 2;                        // range(u) = [0, 2]

    let x = Math.cos(v_prime);
    let y = u_prime;
    let z = Math.sin(v_prime);

    target.set(x, y, z);
}

export function coneParamFunction( u, v, target ) {
    let v_prime = v * 2 * Math.PI;            // range(v) = [0, 2PI]
    let u_prime = u * 2;                      // range(u) = [0, 2]

    let x = u_prime * Math.cos(v_prime);
    let y = u_prime;
    let z = u_prime * Math.sin(v_prime);

    target.set(x, y, z);
}

export function helixParamFunction( u, v, target ) {
    let v_prime = v * 2 * Math.PI;            // range(v) = [0, 2PI]
    let u_prime = u * 2;                      // range(u) = [0, 2]

    let x = u_prime * Math.cos(v_prime);
    let y = 0.5*v_prime;
    let z = u_prime * Math.sin(v_prime);

    target.set(x, y, z);
}

export function torusParamFunction( u, v, target ) {
    let R = 1.5, r = 0.5;

    let v_prime = v * 2 * Math.PI;              // range(v) = [0, 2PI]
    let u_prime = u * 2 * Math.PI;              // range(u) = [0, 2PI]

    let x = (R + r * Math.cos(v_prime)) * Math.cos(u_prime);
    let y = r * Math.sin(v_prime);
    let z = (R + r * Math.cos(v_prime)) * Math.sin(u_prime);

    target.set(x, y, z);
}

export function ellipticParaParamFunction( u, v, target ) {
    let v_prime = v * 2 * Math.PI;              // range(v) = [0, 2PI]
    let u_prime = u * 1.5;                      // range(u) = [0, 1.5]

    let x = u_prime * Math.cos(v_prime);
    let y = u_prime * u_prime;
    let z = u_prime * Math.sin(v_prime);

    target.set(x, y, z);
}

export function hyperbolicParaParamFunction( u, v, target ) {
    let v_prime = v * 2 * Math.PI;              // range(v) = [0, 2PI]
    let u_prime = u * 0.8;                      // range(u) = [0, 1.5]

    let x = u_prime * (1 / Math.cos(v_prime));
    let y = u_prime * u_prime;
    let z = u_prime * Math.tan(v_prime);

    target.set(x, y, z);
}

function generate_3D_mesh_data( paramFunc, resolution=10 ) {
    let data = [];
    let vertex_3D = new THREE.Vector3();

    for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
            const u = i / (resolution - 1);
            const v = j / (resolution - 1);

            paramFunc(u, v, vertex_3D);
            data.push({
                "u": u,
                "v": v,
                "x": vertex_3D.x,
                "y": vertex_3D.y,
                "z": vertex_3D.z
            });
        }
    }

    return data;
}

function generate_3D_mesh( paramFunc, data, polygon_data, resolution=10 ){
    let positions = [];
    let colors = [];
    let indices = [];
    let vertexGrid = [];
    let index = 0;

    // Build index reference for all unique vertices of the surface
     for (let i = 0; i <= resolution; i++) {
        vertexGrid[i] = [];
        for (let j = 0; j <= resolution; j++) {
            let vertex_3D = ["x", "y", "z"].map(key => data[index][key]);
            positions.push(...vertex_3D);

            let color = new THREE.Color(polygon_data[index].color);
            colors.push(color.r, color.g, color.b);

            vertexGrid[i][j] = index++;
        }
    }

    function get_pos_at_index( index ) {
        return [
            positions[3 * index],
            positions[3 * index + 1],
            positions[3 * index + 2],
        ];
    }

    // Create triangle surfaces based on index reference while generating wireframe data
    let wireframe_positions = [];
    let wireframe_edges = [];
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            let p00 = vertexGrid[i][j];
            let p10 = vertexGrid[i + 1][j];
            let p01 = vertexGrid[i][j + 1];
            let p11 = vertexGrid[i + 1][j + 1];


            // Create a quad:
            indices.push(p00, p10, p11);
            indices.push(p00, p11, p01);

            // For wireframe mesh: generate lines only for the parametric grid
            wireframe_positions.push(...get_pos_at_index(p00), ...get_pos_at_index(p10));
            wireframe_edges.push([p00, p10]);
            wireframe_positions.push(...get_pos_at_index(p00), ...get_pos_at_index(p01));
            wireframe_edges.push([p00, p01]);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);

    const material = new THREE.MeshLambertMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);

    const wireframe_line_geometry = new LineSegmentsGeometry();
    wireframe_line_geometry.setPositions(wireframe_positions);
    wireframe_line_geometry.userData.wireframeEdges = wireframe_edges;
    const wireframe_material = new LineMaterial({
        color: 0xffffff,
        linewidth: 2.0,
        transparent: true,
        opacity: 0.6,
        depthTest: false,
    });
    wireframe_material.resolution.set(window.innerWidth, window.innerHeight);
    let wireframe_mesh = new LineSegments2(wireframe_line_geometry, wireframe_material);

    return { mesh: mesh, wireframe: wireframe_mesh };
}

export function update3DRotation( {angleX, angleY, angleZ}, mesh, indicatorRef, inspected_index ) {
    let mesh_mesh = mesh.mesh;
    mesh_mesh.rotation.set(angleX, angleY, angleZ);

    let mesh_wireframe = mesh.wireframe;
    mesh_wireframe.rotation.set(angleX, angleY, angleZ);

    // Update indicator position if exists
    if (indicatorRef.current && inspected_index != null) {
        let positions = mesh_mesh.geometry.attributes.position;
        let indicator_pos = new THREE.Vector3(
            positions.getX(inspected_index),
            positions.getY(inspected_index),
            positions.getZ(inspected_index)
        );
        indicator_pos.applyEuler(new THREE.Euler(angleX, angleY, angleZ));
        indicatorRef.current.position.copy(indicator_pos);
    }
}


/* 4D Parametric Functions */
function kleinSurfaceParamFunction( u, v, target ) {
    // range(u') = [0, 2PI]
    // range(v') = [0, 2PI]
    let a = 1.0, b = 0.4;
    let u_prime = u * 2 * Math.PI;
    let v_prime = v * 2 * Math.PI;

    let x = (a + b * Math.cos(v_prime)) * Math.cos(u_prime);
    let y = (a + b * Math.sin(v_prime)) * Math.sin(u_prime);
    let z = b * Math.sin(v_prime) * Math.cos(u_prime / 2);
    let w = b * Math.sin(v_prime) * Math.sin(u_prime / 2);

    target.set(x, y, z, w);
}

function kleinBottleParamFunction( u, v, target ) {
    // range(u') = [0, 2PI]
    // range(v') = [0, 2PI]
    let r = 0.3, p = 0.7, e = -0.4;

    let u_prime = u * 2 * Math.PI;
    let v_prime = v * 2 * Math.PI;

    let x = r * (Math.cos(u_prime / 2) * Math.cos(v_prime) - Math.sin(u_prime / 2) * Math.sin(2 * v_prime));
    let y = r * (Math.sin(u_prime / 2) * Math.cos(v_prime) + Math.cos(u_prime / 2) * Math.sin(2 * v_prime));
    let z = p * Math.cos(u_prime) * (1 + e * Math.sin(v_prime));
    let w = p * Math.sin(u_prime) * (1 + e * Math.sin(v_prime));

    target.set(x, y, z, w);
}

function torus4DParamFunction( u, v, target ) {
    // range(u') = [0, 2PI]
    // range(v') = [0, 2PI]
    let r = 0.8;

    let u_prime = u * 2 * Math.PI;
    let v_prime = v * 2 * Math.PI;

    let x = r * Math.cos(u_prime);
    let y = r * Math.sin(u_prime)
    let z = r * Math.cos(v_prime)
    let w = r * Math.sin(v_prime)

    target.set(x, y, z, w);
}

function hypersphereParamFunction( u, v, t, target ) {
    // range(u') = [0, PI]
    // range(v') = [0, PI]
    // range(t') = [0, 2PI]

    let u_prime = u * Math.PI;
    let v_prime = v * Math.PI;
    let t_prime = t * 2 * Math.PI;

    let x = Math.cos(u_prime);
    let y = Math.sin(u_prime) * Math.cos(v_prime);
    let z = Math.sin(u_prime) * Math.sin(v_prime) * Math.cos(t_prime);
    let w = Math.sin(u_prime) * Math.sin(v_prime) * Math.sin(t_prime);

    target.set(x, y, z, w);
}

function matrix_to_array( matrix ) {
    return math.flatten( matrix ).toArray();
}

export function project_4D_to_3D( vertex, rotation_matrix=null, distance=2.5, scale=5.0 ) {
    let v_vector = math.matrix(vertex);

    // Perspective Project (treat w = 1 as depth)
    let factor = 1 / (distance - vertex[3]);     // the range for d should be (1, +inf)
    const projection_matrix = math.matrix([
        [factor, 0, 0, 0],
        [0, factor, 0, 0],
        [0, 0, factor, 0]
    ]);
    if ( rotation_matrix ) {
        v_vector = math.multiply(rotation_matrix, v_vector);
    }
    v_vector = math.multiply(projection_matrix, v_vector);
    v_vector = math.multiply(v_vector, scale);

    return matrix_to_array(v_vector);
}

function generate_4D_mesh_data_two_params( paramFunc, resolution=10 ) {
    let data = [];
    let vertex_4D = new THREE.Vector4();

    for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
            const u = i / (resolution - 1);
            const v = j / (resolution - 1);

            paramFunc(u, v, vertex_4D);
            data.push({
                "x": vertex_4D.x,
                "y": vertex_4D.y,
                "z": vertex_4D.z,
                "w": vertex_4D.w
            });
        }
    }

    return data;
}

function generate_4D_mesh_data_three_params( paramFunc, resolution=6 ) {
    let data = [];
    let vertex_4D = new THREE.Vector4();

    for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
            for (let k = 0; k <= resolution; k++) {
                const u = i / (resolution - 1);
                const v = j / (resolution - 1);
                const t = k / (resolution - 1);

                paramFunc(u, v, t, vertex_4D);
                data.push({
                    "x": vertex_4D.x,
                    "y": vertex_4D.y,
                    "z": vertex_4D.z,
                    "w": vertex_4D.w
                });
            }
        }
    }

    return data;

}

export function generateGeomData( mode ) {
    switch (mode) {
        case "cylinder":
            return generate_3D_mesh_data( cylinderParamFunction );
        case "cone":
            return generate_3D_mesh_data( coneParamFunction );
        case "helix":
            return generate_3D_mesh_data( helixParamFunction );
        case "torus":
            return generate_3D_mesh_data( torusParamFunction );
        case "ellipticPara":
            return generate_3D_mesh_data( ellipticParaParamFunction );
        case "hyperbolicPara":
            return generate_3D_mesh_data( hyperbolicParaParamFunction );
        case "hyperSphere":
            return generate_4D_mesh_data_three_params( hypersphereParamFunction );
        case "kleinSurface":
            return generate_4D_mesh_data_two_params( kleinSurfaceParamFunction );
        case "kleinBottle":
            return generate_4D_mesh_data_two_params( kleinBottleParamFunction );
        case "torus4D":
            return generate_4D_mesh_data_two_params( torus4DParamFunction );
        default:
            return;
    }
}

function generate_4D_mesh_two_params( paramFunc, data, polygon_data, resolution=10 ){
    let positions = [];
    let colors = [];
    let indices = [];
    let vertexGrid = [];
    let origin4DVertices = [];
    let index = 0;

    // Build index reference for all unique vertices of the hypersurface
    for (let i = 0; i <= resolution; i++) {
        vertexGrid[i] = [];
        for (let j = 0; j <= resolution; j++) {
             let vertex_4D = ["x", "y", "z", "w"].map(key => data[index][key]);
             origin4DVertices.push(vertex_4D);
             let vertex_3D = project_4D_to_3D(vertex_4D);
             positions.push(...vertex_3D);

             let color = new THREE.Color(polygon_data[index].color);
             colors.push(color.r, color.g, color.b);

             vertexGrid[i][j] = index++;
        }
    }

    function get_pos_at_index( index ) {
        return [
            positions[3 * index],
            positions[3 * index + 1],
            positions[3 * index + 2],
        ];
    }

    // Create triangle surfaces based on index reference while generating wireframe data
    let wireframe_positions = [];
    let wireframe_edges = [];
    for (let i = 0; i < resolution-1; i++) {
        for (let j = 0; j < resolution-1; j++) {
            let p00 = vertexGrid[i][j];
            let p10 = vertexGrid[i + 1][j];
            let p01 = vertexGrid[i][j + 1];
            let p11 = vertexGrid[i + 1][j + 1];


            // Create a quad:
            indices.push(p00, p10, p11);
            indices.push(p00, p11, p01);

            // For wireframe mesh: generate lines only for the parametric grid
            wireframe_positions.push(...get_pos_at_index(p00), ...get_pos_at_index(p10));
            wireframe_edges.push([p00, p10]);
            wireframe_positions.push(...get_pos_at_index(p00), ...get_pos_at_index(p01));
            wireframe_edges.push([p00, p01]);

        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.userData.origin4DVertices = origin4DVertices;

    const material = new THREE.MeshLambertMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);

    const wireframe_line_geometry = new LineSegmentsGeometry();
    wireframe_line_geometry.setPositions(wireframe_positions);
    wireframe_line_geometry.userData.wireframeEdges = wireframe_edges;
    const wireframe_material = new LineMaterial({
        color: 0xffffff,
        linewidth: 2.0,
        transparent: true,
        opacity: 0.6,
        depthTest: false,
    });
    wireframe_material.resolution.set(window.innerWidth, window.innerHeight);
    let wireframe_mesh = new LineSegments2(wireframe_line_geometry, wireframe_material);

    return { mesh: mesh, wireframe: wireframe_mesh };
}

function generate_4D_mesh_three_params( paramFunc, data, polygon_data, resolution=6 ){
    let positions = [];
    let colors = [];
    let indices = [];
    let vertexGrid = [];
    let origin4DVertices = [];
    let index = 0;

    // Build index reference for all unique vertices of the hypersurface
    for (let i = 0; i <= resolution; i++) {
        vertexGrid[i] = [];
        for (let j = 0; j <= resolution; j++) {
            vertexGrid[i][j] = [];
            for (let k = 0; k <= resolution; k++) {

                let vertex_4D = ["x", "y", "z", "w"].map(key => data[index][key]);
                origin4DVertices.push(vertex_4D);
                let vertex_3D = project_4D_to_3D(vertex_4D);
                positions.push(...vertex_3D);

                let color = new THREE.Color(polygon_data[index].color);
                colors.push(color.r, color.g, color.b);

                vertexGrid[i][j][k] = index++;
            }
        }
    }

    function get_pos_at_index( index ) {
        return [
            positions[3 * index],
            positions[3 * index + 1],
            positions[3 * index + 2],
        ];
    }

    // Create triangle surfaces based on index reference while generating wireframe data
    let wireframe_positions = [];
    let wireframe_edges = [];
    for (let i = 0; i < resolution-1; i++) {
        for (let j = 0; j < resolution-1; j++) {
            for (let k = 0; k < resolution-1; k++) {
                let p000 = vertexGrid[i][j][k];
                let p100 = vertexGrid[i + 1][j][k];
                let p010 = vertexGrid[i][j + 1][k];
                let p110 = vertexGrid[i + 1][j + 1][k];
                let p001 = vertexGrid[i][j][k + 1];
                let p101 = vertexGrid[i + 1][j][k + 1];
                let p011 = vertexGrid[i][j + 1][k + 1];
                let p111 = vertexGrid[i + 1][j + 1][k + 1];

                // Create a voxel (6 faces):
                // front face (z = 0)
                indices.push(p000, p100, p110);
                indices.push(p000, p110, p010);

                // back face (z = 1)
                indices.push(p001, p101, p111);
                indices.push(p001, p111, p011);

                // left face (x = 0)
                indices.push(p000, p010, p011);
                indices.push(p000, p011, p001);

                // right face (x = 1)
                indices.push(p100, p110, p111);
                indices.push(p100, p111, p101);

                // top face (y = 1)
                indices.push(p010, p110, p111);
                indices.push(p010, p111, p011);

                // bottom face (y = 0)
                indices.push(p000, p100, p101);
                indices.push(p000, p101, p001)

                // For wireframe mesh: generate lines only for the parametric grid
                wireframe_positions.push(...get_pos_at_index(p000), ...get_pos_at_index(p100));
                wireframe_edges.push([p000, p100]);
                wireframe_positions.push(...get_pos_at_index(p000), ...get_pos_at_index(p010));
                wireframe_edges.push([p000, p010]);
                wireframe_positions.push(...get_pos_at_index(p000), ...get_pos_at_index(p001));
                wireframe_edges.push([p000, p001]);
            }
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.userData.origin4DVertices = origin4DVertices;

    const material = new THREE.MeshLambertMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);

    const wireframe_line_geometry = new LineSegmentsGeometry();
    wireframe_line_geometry.setPositions(wireframe_positions);
    wireframe_line_geometry.userData.wireframeEdges = wireframe_edges;
    const wireframe_material = new LineMaterial({
        color: 0xffffff,
        linewidth: 2.0,
        transparent: true,
        opacity: 0.6,
        depthTest: false,
    });
    wireframe_material.resolution.set(window.innerWidth, window.innerHeight);
    let wireframe_mesh = new LineSegments2(wireframe_line_geometry, wireframe_material);

    return { mesh: mesh, wireframe: wireframe_mesh };
}

export function generateMesh( mode, data, polygon_data ) {
    switch (mode) {
        case "cylinder":
            return generate_3D_mesh( cylinderParamFunction, data, polygon_data );
        case "cone":
            return generate_3D_mesh( coneParamFunction, data, polygon_data );
        case "helix":
            return generate_3D_mesh( helixParamFunction, data, polygon_data );
        case "torus":
            return generate_3D_mesh( torusParamFunction, data, polygon_data );
        case "ellipticPara":
            return generate_3D_mesh( ellipticParaParamFunction, data, polygon_data );
        case "hyperbolicPara":
            return generate_3D_mesh( hyperbolicParaParamFunction, data, polygon_data );
        case "hyperSphere":
            return generate_4D_mesh_three_params( hypersphereParamFunction, data, polygon_data );
        case "kleinSurface":
            return generate_4D_mesh_two_params( kleinSurfaceParamFunction, data, polygon_data );
        case "kleinBottle":
            return generate_4D_mesh_two_params( kleinBottleParamFunction, data,  polygon_data);
        case "torus4D":
            return generate_4D_mesh_two_params( torus4DParamFunction, data, polygon_data );
        default:
            return;
    }
}

function rotate_4D_for_a_plane(axisA, axisB, theta) {
    const mat = math.identity(4)._data; // 4x4 identity
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    mat[axisA][axisA] = c;
    mat[axisA][axisB] = s === 0 ? 0 : -s;
    mat[axisB][axisA] = s;
    mat[axisB][axisB] = c;

    return math.matrix(mat);
}

export function make4DRotationMatrix({ angleXY, angleXZ, angleYZ, angleXW, angleYW, angleZW }) {
    let m = math.identity(4);

    const rotXY = rotate_4D_for_a_plane(0, 1, angleXY);
    const rotXZ = rotate_4D_for_a_plane(0, 2, angleXZ);
    const rotYZ = rotate_4D_for_a_plane(1, 2, angleYZ);
    const rotXW = rotate_4D_for_a_plane(0, 3, angleXW);
    const rotYW = rotate_4D_for_a_plane(1, 3, angleYW);
    const rotZW = rotate_4D_for_a_plane(2, 3, angleZW);

    m = math.multiply(rotXY, m);
    m = math.multiply(rotXZ, m);
    m = math.multiply(rotYZ, m);
    m = math.multiply(rotXW, m);
    m = math.multiply(rotYW, m);
    m = math.multiply(rotZW, m);
    return m
}

export function update4DRotation( mesh, indicatorRef, inspected_index, rotation_matrix ) {
    // Update mesh geometry:
    let mesh_geom = mesh.mesh.geometry;
    let mesh_pos_attr = mesh_geom.getAttribute('position');
    let origin4DVertices = mesh_geom.userData.origin4DVertices;

    for (let i = 0; i < origin4DVertices.length; i++) {
        const vertex_4D = origin4DVertices[i];
        const vertex_3D = project_4D_to_3D(vertex_4D, rotation_matrix);
        mesh_pos_attr.setXYZ(i, ...vertex_3D);
    }

    mesh_pos_attr.needsUpdate = true;

    // Update wireframe geometry:
    let wireframe_geom = mesh.wireframe.geometry;
    let wireframe_start_attr = wireframe_geom.getAttribute('instanceStart');
    let wireframe_end_attr = wireframe_geom.getAttribute('instanceEnd');
    let wireframe_edges = wireframe_geom.userData.wireframeEdges;

    let index = 0;
    for (let [start_id, end_id] of wireframe_edges) {
        let start_v_4D = origin4DVertices[start_id];
        let end_v_4D = origin4DVertices[end_id];

        let start_v_3D = project_4D_to_3D(start_v_4D, rotation_matrix);
        let end_v_3D = project_4D_to_3D(end_v_4D, rotation_matrix);
        wireframe_start_attr.setXYZ(index, ...start_v_3D)
        wireframe_end_attr.setXYZ(index, ...end_v_3D);
        index++;
    }

    wireframe_start_attr.needsUpdate = true;
    wireframe_end_attr.needsUpdate = true;

    // Update indicator position if exists
    if (indicatorRef.current && inspected_index != null) {
        const vertex_4D = origin4DVertices[inspected_index];
        const vertex_3D = project_4D_to_3D(vertex_4D, rotation_matrix);
        indicatorRef.current.position.set(...vertex_3D);
    }
}

export function initializeRender( container, camera_pos=[3, 4.5, 3], axis_length = 3.5 ) {
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
    camera.position.set(...camera_pos);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width * 2, height * 2, false);
    renderer.domElement.style.width  = width + "px";
    renderer.domElement.style.height = height + "px";
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
    const axes = new THREE.AxesHelper(axis_length); // 2 = axis length
    scene.add(axes);

    // Add axis labels
    const loader = new FontLoader();
    let label_meshes = new THREE.Group();
    loader.load(`${import.meta.env.BASE_URL}fonts/Roboto_Regular.typeface.json`, function (font) {
        function generate_axis_label(text, color, pos) {
            const shapes = font.generateShapes(text, 0.2);
            const geometry = new THREE.ShapeGeometry(shapes);
            const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
            const label_mesh = new THREE.Mesh(geometry, material);
            label_mesh.position.set(...pos);
            label_mesh.lookAt(camera.position);
            label_meshes.add(label_mesh);
        }

        generate_axis_label('X', "red", [axis_length+0.1, 0, 0]);
        generate_axis_label('Y', "green", [0, axis_length+0.1, 0]);
        generate_axis_label('Z', "blue", [0, 0, axis_length+0.1]);
    });
    scene.add(label_meshes);

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    return [ scene, camera, renderer, controls, label_meshes, axes ];
}