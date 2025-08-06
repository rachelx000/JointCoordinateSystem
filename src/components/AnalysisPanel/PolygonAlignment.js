import * as d3 from 'd3';
import {
    path_str_to_point_list,
    point_list_to_path_str,
    plot_polygons,
    plot_centroids,
    plot_origin,
} from "../JCS.js";
import { jcs_origin, coord_len } from "../JCS.js";
import { isEqual } from "lodash";

const size = 300;
const scaling = 0.35;
const alignment_axes = {
    "point": {
        x: { p1: [15, 15+size*0.5], p2: [15+size, 15+size/2 ], arrow: [[15+size, 10+size/2], [15+size, 20+size/2], [25+size, 15+size/2]], title: "x", titlePos: [20+size, 30+size/2] },
        y: { p1: [15+size*0.2, 15], p2: [15+size*0.2, 15+size], arrow: [[10+size*0.2, 15], [20+size*0.2, 15], [15+size*0.2, 5]], title: "y", titlePos: [size*0.2, 15] },
        origin: [15+size*0.2, 15+size*0.5]
    },
    "side": {
        x: { p1: [15, 30+size*0.8], p2: [ 15+size, 30+size*0.8 ], arrow: [[15+size, 30+size*0.8-5], [15+size, 30+size*0.8+5], [25+size, 30+size*0.8]], title: "x", titlePos: [20+size, 45+size*0.8] },
        y: { p1: [15+size*0.3, 30], p2: [15+size*0.3, 30+size*0.8], arrow: [[10+size*0.3, 45], [20+size*0.3, 45], [15+size*0.3, 35]], title: "y", titlePos: [size*0.3, 45] },
        origin: [15+size*0.3, 30+size*0.8]
    },
    "centroid": {
        x: { p1: [15, 15+size*0.5], p2: [15+size, 15+size/2 ], arrow: [[15+size, 10+size/2], [15+size, 20+size/2], [25+size, 15+size/2]], title: "x", titlePos: [20+size, 30+size/2] },
        y: { p1: [15+size*0.5, 15], p2: [15+size*0.5, 15+size], arrow: [[10+size*0.5, 15], [20+size*0.5, 15], [15+size*0.5, 5]], title: "y", titlePos: [size*0.5, 15] },
        origin: [15+size*0.5, 15+size*0.5]
    }
};

function align_a_polygon( polygon_obj, align_mode ) {
    let origin = alignment_axes[align_mode.mode].origin;
    let aligned_polygon;
    switch (align_mode.mode) {
        case "point":
            aligned_polygon = align_a_polygon_at_a_corner( polygon_obj, align_mode.index, origin );
            break;
        case "side":
            aligned_polygon = align_a_polygon_at_a_side( polygon_obj, align_mode.index, origin );
            break;
        case "centroid":
            aligned_polygon = align_a_polygon_at_a_centroid( polygon_obj, origin );
            break;
    }
    return aligned_polygon;
}

function align_a_polygon_at_a_corner( polygon_obj, corner_id, origin ) {
    let polygon_points = path_str_to_point_list(polygon_obj.points);
    let ref_corner = polygon_points[corner_id];
    let translation = [0, 1].map(i => ref_corner[i]*scaling - origin[i]);

    // Rotate to ensure all aligned polygon is at right side of the y axis
    let theta = (90 * corner_id * Math.PI) / 180.0;
    let rot_matrix = [
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta),  Math.cos(theta)],
    ];
    function rotate_point(p) {
        let x = rot_matrix[0][0] * (p[0] - origin[0]) + rot_matrix[0][1] * (p[1] - origin[1]) + origin[0];
        let y = rot_matrix[1][0] * (p[0] - origin[0]) + rot_matrix[1][1] * (p[1] - origin[1]) + origin[1];
        return [x, y];
    }

    // Apply the translation for all points of the polygon
    let aligned_polygon = polygon_points.map((p) => {
        let translated_p = [p[0]*scaling-translation[0], p[1]*scaling-translation[1]];
        return rotate_point(translated_p);
    });
    let aligned_centroid = rotate_point([0, 1].map((i) => [polygon_obj.centroid[i]*scaling-translation[i]]));

    return {
        ...(Object.prototype.hasOwnProperty.call(polygon_obj, 'id') && { id: polygon_obj.id }),
        ...(Object.prototype.hasOwnProperty.call(polygon_obj, 'color') && { color: polygon_obj.color }),
        ...(Object.prototype.hasOwnProperty.call(polygon_obj, 'depVal') && { depVal: polygon_obj.depVal }),
        points: point_list_to_path_str( aligned_polygon ),
        originalPoints: polygon_obj.points,
        centroid: aligned_centroid,
        originalCentroid: polygon_obj.centroid,
        metrics: {
            'area': polygon_obj.area,
            'compactness': compute_compactness( polygon_points ),
            'diagonal-ratio': compute_diagonal_ratio( polygon_points ),
            'angular-regularity': compute_angular_regularity( polygon_points )
        }
    };
}

function align_a_polygon_at_a_side( polygon_obj, side_id, origin ) {
    let polygon_points = path_str_to_point_list(polygon_obj.points);

    // Align the side's bottom corner at the origin
    let aligned_polygon_at_origin = align_a_polygon_at_a_corner( polygon_obj, side_id, origin );
    let aligned_point_list_at_origin = path_str_to_point_list( aligned_polygon_at_origin.points );
    let aligned_centroid_at_origin = aligned_polygon_at_origin.centroid;

    // Rotate to align the side with y axis
    let endpoint = aligned_point_list_at_origin[(side_id+3) % 4];
    let theta = -Math.atan2(endpoint[1]-origin[1], endpoint[0]-origin[0]);
    let rot_matrix = [
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta),  Math.cos(theta)],
    ];
    function rotate_point(p) {
        let x = rot_matrix[0][0] * (p[0] - origin[0]) + rot_matrix[0][1] * (p[1] - origin[1]) + origin[0];
        let y = rot_matrix[1][0] * (p[0] - origin[0]) + rot_matrix[1][1] * (p[1] - origin[1]) + origin[1];
        return [x, (y - origin[1] > 0 ? y - 2*(y - origin[1]) : y)];
    }
    let aligned_polygon = aligned_point_list_at_origin.map(p => rotate_point(p));
    let aligned_centroid = rotate_point(aligned_centroid_at_origin);

    return {
        ...(Object.prototype.hasOwnProperty.call(polygon_obj, 'id') && { id: polygon_obj.id }),
        ...(Object.prototype.hasOwnProperty.call(polygon_obj, 'color') && { color: polygon_obj.color }),
        ...(Object.prototype.hasOwnProperty.call(polygon_obj, 'depVal') && { depVal: polygon_obj.depVal }),
        points: point_list_to_path_str( aligned_polygon ),
        originalPoints: polygon_obj.points,
        centroid: aligned_centroid,
        originalCentroid: polygon_obj.centroid,
        metrics: {
            'area': polygon_obj.area,
            'compactness': compute_compactness( polygon_points ),
            'diagonal-ratio': compute_diagonal_ratio( polygon_points ),
            'angular-regularity': compute_angular_regularity( polygon_points )
        }
    };
}

function align_a_polygon_at_a_centroid( polygon_obj, origin ) {
    let polygon_points = path_str_to_point_list(polygon_obj.points);
    let translation = [0, 1].map(i => polygon_obj.centroid[i]*scaling - origin[i]);

    let aligned_polygon = polygon_points.map((p) =>
        [p[0]*scaling-translation[0], p[1]*scaling-translation[1]]);

    return {
        ...(Object.prototype.hasOwnProperty.call(polygon_obj, 'id') && { id: polygon_obj.id }),
        ...(Object.prototype.hasOwnProperty.call(polygon_obj, 'color') && { color: polygon_obj.color }),
        ...(Object.prototype.hasOwnProperty.call(polygon_obj, 'depVal') && { depVal: polygon_obj.depVal }),
        points: point_list_to_path_str( aligned_polygon ),
        originalPoints: polygon_obj.points,
        centroid: origin,
        originalCentroid: polygon_obj.centroid,
        metrics: {
            'area': polygon_obj.area,
            'compactness': compute_compactness( polygon_points ),
            'diagonal-ratio': compute_diagonal_ratio( polygon_points ),
            'angular-regularity': compute_angular_regularity( polygon_points )
        }
    };
}

// Helper functions for metric computations:
function norm(p) { return [(p[0] - jcs_origin[0]) / coord_len, (p[1] - jcs_origin[1]) / coord_len]; }
function dist(p1, p2) { return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]); }
function multiply_c(p, c) { return [c*p[0], c*p[1]]; }
function divide_c(p, c) { return [p[0]/c, p[1]/c]; }
function add(p1, p2) { return [p1[0] + p2[0], p1[1] + p2[1]]; }
function length(v) { return Math.hypot(v[0], v[1]); }
function compute_vector(start, end) { return [start[0]-end[0], start[1]-end[1]]; }
function dot_prod(v1, v2) { return v1[0]*v2[0] + v1[1]*v2[1]; }
function round(n, prec) {
    let factor = Math.pow(10, prec);
    return Math.round(n * factor) / factor;
}

function calc_area( point_list ) {
    // Use Shoelace formula to calculate the area of quad given the vertices info
    let area = 0, n = point_list.length;
    for (let i = 0; i < point_list.length; i++) {
        let [x1, y1] = point_list[i];
        let [x2, y2] = point_list[(i + 1) % n];
        area += (x1 * y2 - x2 * y1);
    }
    return round(Math.abs(area / 2), 5);
}

/* function compute_cyclicity( point_list ) {
    let ab, bc, cd, da, ac, bd;
    let [va, vb, vc, vd] = point_list.map(point => norm(point));

    // Computed in 0-1 scale:
    ab = dist(va, vb);
    bc = dist(vb, vc);
    cd = dist(vc, vd);
    da = dist(vd, va);
    ac = dist(va, vc);
    bd = dist(vb, vd);

    // Ptolemy's theorem:
    return round(ac*bd - (ab*cd+da*bc), 2);
} */

export function compute_area( point_list ) {
    let [va, vb, vc, vd] = point_list.map(point => norm(point));
    return calc_area([va, vb, vc, vd]);
}

function compute_compactness( point_list ) {
    let ab, bc, cd, da, perimeter, polygon_area;
    let [va, vb, vc, vd] = point_list.map(point => norm(point));

    // Computed in 0-1 scale:
    polygon_area = calc_area( [va, vb, vc, vd] );
    ab = dist(va, vb);
    bc = dist(vb, vc);
    cd = dist(vc, vd);
    da = dist(vd, va);
    perimeter = ab + bc + cd + da;

    return round((perimeter ** 2) / (4 * Math.PI * polygon_area), 3);
}

function compute_diagonal_ratio( point_list ) {
    let ac, bd;
    let [va, vb, vc, vd] = point_list.map(point => norm(point));

    // computed in 0-1 scale:
    ac = dist(va, vc);
    bd = dist(vb, vd);

    return round(ac / bd, 5);
}

function compute_interior_angle(p1, c, p2) {
    // Compute two vectors for the angle:
    let c_p1 = compute_vector(c, p1);
    let c_p2 = compute_vector(c, p2);

    // Compute the vector lengths
    let c_p1_len = length(c_p1);
    let c_p2_len = length(c_p2);

    // compute angle
    let cos_theta = dot_prod(c_p1, c_p2) / (c_p1_len * c_p2_len);
    if (cos_theta < -1 || cos_theta > 1) {
        console.log("Warning: cos_theta = ", cos_theta);
    }
    cos_theta = Math.max(Math.min(cos_theta, 1), -1);

    return Math.acos(cos_theta) * (180 / Math.PI);
}

function compute_angular_regularity( point_list ) {
    let [va, vb, vc, vd] = point_list.map(point => norm(point));

    let angle_va = compute_interior_angle(vd, va, vb);
    let angle_vb = compute_interior_angle(va, vb, vc);
    let angle_vc = compute_interior_angle(vb, vc, vd);
    let angle_vd = compute_interior_angle(vc, vd, va);

    return round(Math.abs(angle_va-90)+ Math.abs(angle_vb-90)
        + Math.abs(angle_vc-90) + Math.abs(angle_vd-90), 2);
}

export function alignPolygons( polygon_data, align_mode ) {
    let polygon_data_after_alignment = [];

    polygon_data.forEach((polygon) => {
        let aligned_polygon = align_a_polygon(polygon, align_mode);
        polygon_data_after_alignment.push(aligned_polygon);
    });

    return polygon_data_after_alignment;
}

function plot_alignment_axis( axis_id, axis_obj ) {
    // Draw the axis line
    d3.select(axis_id+">line")
        .attr("x1", axis_obj.p1[0]).attr("y1", axis_obj.p1[1])
        .attr("x2", axis_obj.p2[0]).attr("y2", axis_obj.p2[1])
        .attr("stroke", "#000")

    // Draw the axis arrow
    d3.select(axis_id+">polygon")
        .attr("points", point_list_to_path_str(axis_obj.arrow))
        .style("fill", "#000")

    // Draw the axis title
    d3.select(axis_id+">text")
        .attr("x", axis_obj.titlePos[0])
        .attr("y", axis_obj.titlePos[1])
        .attr("fontSize", 16)
        .text(axis_obj.title);
}

export function computeAlignedPolygonOrder( aligned_polygons, align_mode ) {
    if ( align_mode.mode !== "centroid" ) {
        // Compute order by angles
        let angle_list = [];
        let origin = alignment_axes[align_mode.mode].origin;

        aligned_polygons.forEach((polygon) => {
            let centroid_angle;
            switch (align_mode.mode) {
                case "point":
                    centroid_angle = Math.atan((origin[1] - polygon.centroid[1])/(polygon.centroid[0] - origin[0]));
                    break;
                case "side":
                    centroid_angle = Math.atan((polygon.centroid[0] - origin[0])/(origin[1] - polygon.centroid[1]));
                    break;
            }
            angle_list.push({
                id: polygon.id,
                angle: centroid_angle,
                length: Math.hypot(polygon.centroid[0] - origin[0], polygon.centroid[1] - origin[1]),
                depVal: polygon.depVal,
            });
        });

        angle_list.sort((a, b) => {
            let angle_diff = a.angle - b.angle;
            let len_diff = a.length - b.length;
            let depVal_diff = a.depVal - b.depVal;
            return angle_diff !== 0 ? angle_diff : (len_diff !== 0 ? len_diff : depVal_diff);
        });

        return angle_list.map(angle => angle.id);
    } else {
        // Compute order by simplified Procrustes
        // Step 1: compute the mean shape
        let mean = Array(4).fill([0, 0]);
        aligned_polygons.forEach( (polygon) => {
                let curr_point_list = path_str_to_point_list(polygon.points);
                curr_point_list.forEach((p, i) => {
                    mean[i] = add(mean[i], multiply_c(p, 1.0));
                })
            }
        )
        mean.forEach((p, i) => { mean[i] = divide_c(p, 4.0); });

        // Step 2: compute Procrustes distance from each quad to the mean shape
        let flat_mean = mean.flat();
        let distance = aligned_polygons.map( (polygon) => {
            let flat_curr_point_list = path_str_to_point_list(polygon.points).flat();
            let sum_square = 0;
            flat_curr_point_list.forEach((val, i) => {
                sum_square += (val - flat_mean[i]) ** 2
            })
            return {
                id: polygon.id,
                distance: Math.sqrt(sum_square),
                depVal: polygon.depVal,
            }
        });

        // Step 3: sort the aligned polygons by their Procrustes distances
        distance.sort((a, b) => {
            let distance_diff = a.distance - b.distance;
            let depVal_diff = a.depVal - b.depVal;
            return distance_diff !== 0 ? distance_diff : depVal_diff;
        });

        return distance.map(distance => distance.id);
    }
}

export function plotPolygonAlignment( aligned_polygons, origin_data, if_centroids, if_color_block_mode, align_mode,
                                      if_inspect_mode, inspected_index, set_inspected_index, aligned_origin_data, set_aligned_origin_data ) {
    let zoom_k = 1;
    // Plot the axes for alignment:
    plot_alignment_axis( "#alignment-x-axis", alignment_axes[align_mode.mode].x );
    plot_alignment_axis( "#alignment-y-axis", alignment_axes[align_mode.mode].y );

    // Plot polygons and centroids (if needed):
    function plotData() {
        plot_polygons("#aligned-polygons", aligned_polygons, inspected_index, if_color_block_mode);
        plot_centroids("#aligned-centroids", aligned_polygons, if_centroids, inspected_index, if_color_block_mode);
    }
    plotData();

    // Plot origin if origin mode is on:
    function plotOrigin() {
        if ( origin_data !== null ) {
            let curr_aligned_origin = align_a_polygon(origin_data, align_mode);
            if (!isEqual( curr_aligned_origin, aligned_origin_data))
                set_aligned_origin_data(curr_aligned_origin);
            plot_origin( curr_aligned_origin, "aligned-origin", if_centroids, if_color_block_mode);
        } else {
            d3.selectAll(".aligned-origin").selectAll("*").attr("opacity", 0);
            set_aligned_origin_data(null);
        }
    }
    plotOrigin();

    function setInspect() {
        if (if_inspect_mode) {
            d3.select('#aligned-centroids')
                .selectAll('circle')
                .on('mouseover', (e, d) => {
                    inspected_index = d.id;
                    set_inspected_index(d.id);
                })
                .on('mouseout', () => {
                    set_inspected_index(null);
                });
        } else {
            d3.select('#aligned-centroids')
                .selectAll('circle')
                .on('mouseover', null)
                .on('mouseout', null);
        }
    }
    setInspect();

    function updateView() {
        if (if_centroids) {
            d3.select('#aligned-centroids')
                .selectAll('circle')
                .attr('r', (d) => (d.id === inspected_index) ? (5 / zoom_k) : (4 / zoom_k))
                .attr('stroke-width', (d) => (if_color_block_mode) ? 1.0 / zoom_k : ( inspected_index !== null ? (d.id === inspected_index ? 1.0 / zoom_k : 0.0 ) : 0.0))
                .attr('opacity', (d) => (inspected_index !== null) ? (d.id === inspected_index ? 1.0 : 0.4) : 1.0);

            // Move inspected point to front
            d3.select('#aligned-centroids')
                .selectAll('circle')
                .each(function (d, i) {
                    if (i === inspected_index) {
                        this.parentNode.appendChild(this);
                    }
                });
        }
    }

    let alignment_zoom = d3.zoom()
        .scaleExtent([1, 50])
        .translateExtent([[-200, -200], [500, 500]])
        .on('zoom', (e) => {
            zoom_k = e.transform.k;
            d3.selectAll(".alignment-plot").attr('transform', e.transform);
            updateView();
        });
    d3.select("#alignment-canvas").call(alignment_zoom);

    return {
        updateInspectedIndex: (new_index) => {
            inspected_index = new_index;
            plotData();
            updateView();
        },
        updateColorBlockMode: (now_color_block_mode) => {
            if_color_block_mode = now_color_block_mode;
            plotData();
            updateView();
        },
        updateCentroids: (now_if_centroid) => {
            if_centroids = now_if_centroid;
            plot_centroids("#aligned-centroids", aligned_polygons, if_centroids, inspected_index, if_color_block_mode);
            plotOrigin();
            updateView();
        },
        updateOrigin: (now_origin_data, now_aligned_origin_data) => {
            origin_data = now_origin_data;
            aligned_origin_data = now_aligned_origin_data;
            plotOrigin();
        },
        updateInspectMode: (now_inspect_mode) => {
            if_inspect_mode = now_inspect_mode;
            setInspect();
        },
        resetZoomPan: () => {
            d3.selectAll("#alignment-canvas")
                .transition()
                .duration(500)
                .call(alignment_zoom.transform, d3.zoomIdentity);
        }
    };
}
