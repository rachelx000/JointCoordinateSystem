import * as d3 from 'd3';
import { point_list_to_path_str, plot_polygons, plot_centroids, plot_origin } from "./JCS.js";

const size = 300;
const scaling = 0.4;
const alignment_axes = {
    x: { p1: [15, 10+size*0.5], p2: [ size-80, 10+size/2 ], arrow: [[size-80, 5+size/2], [size-80, 15+size/2], [size-70, 10+size/2]], title: "x", titlePos: [size-75, 30+size/2] },
    y: { p1: [15, 10], p2: [15, 10+size], arrow: [[10, 10], [20, 10], [15, 0]], title: "y", titlePos: [0, 10] }
};
let aligned_polygons = [];

function path_str_to_point_list( path_str ) {
    return path_str.split(" ").map(point => point.split(","));
}

function align_polygons_at_a_corner( polygon_data ) {
    polygon_data.forEach((polygon) => {
            let aligned_polygon = align_a_polygon_at_a_corner( polygon, 0 );
            aligned_polygons.push(aligned_polygon);
    });
}

function align_a_polygon_at_a_corner( polygon_obj, corner_id ) {
    let polygon_points = path_str_to_point_list(polygon_obj.points);
    let ref_corner = polygon_points[corner_id];
    let translation = [0, 1].map(i => ref_corner[i]*scaling - alignment_axes.x.p1[i]);

    // Apply the translation for all points of the polygon
    let translated_polygon = polygon_points.map((p) => [p[0]*scaling-translation[0], p[1]*scaling-translation[1]]);
    let translated_centroid = [0, 1].map((i) => [polygon_obj.centroid[i]*scaling-translation[i]]);

    return {
        ...(polygon_obj.hasOwnProperty('id') && { id: polygon_obj.id }),
        ...(polygon_obj.hasOwnProperty('color') && { color: polygon_obj.color }),
        points: point_list_to_path_str( translated_polygon ),
        centroid: translated_centroid
    };
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

export function polygonAlignment( polygon_data, origin_data, if_centroids, if_color_block_mode ) {
    aligned_polygons = [];

    // Plot the axes for alignment:
    plot_alignment_axis( "#alignment-x-axis", alignment_axes.x );
    plot_alignment_axis( "#alignment-y-axis", alignment_axes.y );

    // Align and plot polygons and centroids (if needed):
    align_polygons_at_a_corner( polygon_data );
    plot_polygons("#polygons-alignment", aligned_polygons, null, if_color_block_mode);
    plot_centroids("#centroids-alignment", aligned_polygons, if_centroids, null, if_color_block_mode)

    // Plot origin if origin mode is on:
    if ( origin_data ) {
        let aligned_origin = align_a_polygon_at_a_corner(origin_data, 0);
        plot_origin( aligned_origin, "aligned-origin", if_centroids, if_color_block_mode);
    } else {
        d3.selectAll(".aligned-origin").selectAll("*").attr("opacity", 0);
    }
}

export function shapeAnalysis( polygon_data ) {
    console.log("shape analyzing ...");
}