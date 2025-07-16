import * as d3 from 'd3';
import { point_list_to_path_str, plot_polygons } from "./JCS.js";

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
    let translation, translated_polygon;
    polygon_data.forEach((polygon, i) => {
            [translation, translated_polygon] = align_a_polygon_at_a_corner( path_str_to_point_list(polygon.points), 0 );
            aligned_polygons.push({ id: i,
                                    points: point_list_to_path_str( translated_polygon ),
                                    color: polygon.color,
                                    centroid: [(polygon.centroid[0]-translation[0])*scaling, (polygon.centroid[1]-translation[1])*scaling]
            });

        });
}

function align_a_polygon_at_a_corner( polygon, corner_id ) {
    let ref_corner = polygon[corner_id];
    let translate_x = ref_corner[0]*scaling - alignment_axes.x.p1[0];
    let translate_y = ref_corner[1]*scaling - alignment_axes.x.p1[1];

    // Apply the translation for all points of the polygon
    let translation = [translate_x, translate_y];
    let translated_polygon = polygon.map((p) => [p[0]*scaling-translate_x, p[1]*scaling-translate_y]);

    return [translation, translated_polygon];
}

function plot_alignment() {
    d3.select('#polygons-alignment')
        .selectAll('polygon')
        .data(aligned_polygons)
        .join('polygon')
        .attr('points', function(d) { return point_list_to_path_str(d); })
        .attr('stroke', function(d, i) { return polygon_color[i]; })
        .attr('stroke-width', if_color_block_mode_on ? 0 : 2)
        .attr('fill', function(d, i) { return polygon_color[i] })
        .attr('fill-opacity', color_block_mode_on ? 0.3 : 0.0 );
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

export function polygonAlignment( polygon_data ) {
    aligned_polygons = [];

    // Plot the axes for alignment
    plot_alignment_axis( "#alignment-x-axis", alignment_axes.x );
    plot_alignment_axis( "#alignment-y-axis", alignment_axes.y );

    // Align and plot polygons
    align_polygons_at_a_corner( polygon_data );
    plot_polygons("#polygons-alignment", aligned_polygons, null, false);

}

export function shapeAnalysis( polygon_data ) {
    console.log("shape analyzing ...");
}