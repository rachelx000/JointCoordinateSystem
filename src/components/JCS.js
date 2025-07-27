import * as d3 from 'd3';
import { isEqual } from "lodash";

// Global data and generators:
export const jcs_origin = [100, 70];
export let coord_len, corner_len, axis_len;
let coord_corner_data, axis_translation, axis_indicator_info;
let left_scale, right_scale, top_scale, bottom_scale, color_scale;
let polygons;
let centroid_quadtree;
let line_generator = d3.line().defined(function(d) {return d !== null; });

export function get_varnames( data ) {
    return Object.keys(data[0]);
}

export function reset_variable_selector() {
    d3.selectAll(".IV").property("checked", false);
    d3.selectAll(".DV").property("checked", false);
}



function get_min_and_max( data, varname ){
    let min = Math.min(...data.map(data_entry => data_entry[varname]));
    let max = Math.max(...data.map(data_entry => data_entry[varname]));
    return [min, max];
}

function calculate_PCC( x_data, y_data ) {
    let x_sum, y_sum, xy_sum, x2_sum, y2_sum, n, pearson_r;
    x_data.length === y_data.length ? n = x_data.length : null;

    if (n) {
        y_sum = y_data.reduce((sum, val) => sum + val, 0);
        y2_sum = y_data.reduce((sum, val) => sum + val * val, 0);
        x_sum = x_data.reduce((sum, val) => sum + val, 0);
        x2_sum = x_data.reduce((sum, val) => sum + val * val, 0);
        xy_sum = x_data.reduce((sum, x_val, ind) => sum += (x_val * y_data[ind]), 0);
        pearson_r = (n * xy_sum - x_sum * y_sum) / Math.sqrt((n * x2_sum - x_sum * x_sum) * (n * y2_sum - y_sum * y_sum));
        return pearson_r;
    }
    else{
        throw new Error("x_data and y_data have different lengths.")
    }
}

function calculate_PCC_for_dataset( data, now_IVs, now_DV ) {
    let pcc_data = [];
    let y_data = data.map(obj => parseFloat(obj[now_DV]));

    for (let i = 0; i < 4; i++ ) {
        let x_data = data.map(obj => parseFloat(obj[now_IVs[i]]));
        let curr_r = calculate_PCC( x_data, y_data );
        pcc_data.push(curr_r);
    }
    // console.log("Pearson correlation coefficients of current data:", pcc_data);
    return pcc_data;
}

function logarithmic_growth_check( data, varname ) {
    let pcc, log;

    // filter and sort unique values from the input data array
    let unique_data = [...new Set([...data.map(obj => obj[varname])])];
    unique_data.sort((a, b)=> a - b);

    let indices = [...Array(unique_data.length).keys()];

    // check if it is base-10 logarithmic growth
    let log10_data = unique_data.map((x) => Math.log10(x));

    // replace infinite vals and sort it in ascending order
    log10_data = log10_data.map((x) => (x === Infinity) || (x === -Infinity) ? 0 : x );
    log10_data.sort((a, b) => a - b);
    pcc = calculate_PCC(indices, log10_data);
    if (pcc > 0.999) { log = "log10"; }
    return [ log, unique_data ];
}

function generate_numerical_scale( data, varname, id, axis_generator, axis_range, if_origin_mode, if_vertical ) {
    // Check if the logarithmic scale is needed and generate the corresponding scale
    let [if_log, unique_data] = logarithmic_growth_check( data, varname );
    let data_range = get_min_and_max(data, varname);
    let scale;

    // Convert to the scale where 0 is at the middle when origin mode is on
    if ( if_origin_mode ) {
        if ( Math.abs(data_range[0]) >= data_range[1] )
            data_range = [data_range[0], Math.abs(data_range[0])];
        else
            data_range = [-data_range[1], data_range[1]];
    }
    data_range = if_vertical ? data_range.reverse() : data_range;

    // Remove 0 to avoid conflicts with the d3 log-scale
    if ( if_log === "log10" && if_origin_mode === false ) {
        if (data_range[0] === 0) {
            data_range[0] = unique_data[1] / 10;
            unique_data.unshift(0);
        } else if (data_range[1] === 0) {
            data_range[1] = unique_data[0] / 10;
            unique_data.push(0);
        }
        scale = d3.scaleLog().base(10).clamp(true).domain(data_range).range(axis_range).nice();
    }
    else {
        scale = d3.scaleLinear().domain(data_range).range(axis_range).nice();
    }

    // Make an axis generator function
    let axis = axis_generator(scale);

    // Specify the ticks if the log scale is used
    if ( if_log === "log10" && if_origin_mode === false ) {
        axis.tickValues(unique_data).tickFormat(d3.format(".0e"));
    }

    // Plot the scale region of the axis while applying the translation:
    d3.select(id).attr("transform", "translate("+axis_translation[id][0]+","+axis_translation[id][1]+")").call(axis);
    return scale;
}

function generate_axis_title( axis_id, axis_title, if_vertical ) {
    let axis_selector = d3.select(axis_id + "-title");
    if (if_vertical) {
        // Apply translation:
        if ( axis_id === '#left-axis')
            axis_selector.attr('transform', "translate("+"-40"+","+axis_len*0.5+")");
        else
            axis_selector.attr('transform', "translate("+"40"+","+axis_len*0.5+")");

        axis_selector.selectAll("tspan").remove();                       // clear existing text

        let words = axis_title.split(" ");
        // Split the axis title into multiple lines if it contains multiple words
        words.forEach((word, i) => {
            axis_selector.append("tspan")
                .text(word)
                .attr('x', 0)
                .attr('dy', i === 0 ? '0em' : '1.0em');
        });
    }
    else {
        if ( axis_id === '#top-axis')
            axis_selector.attr('transform', "translate("+axis_len*0.5+","+"-35"+")");
        else
            axis_selector.attr('transform', "translate("+axis_len*0.5+","+"35"+")");
        axis_selector.text(axis_title);
    }
}

function generate_axis( data, now_IVs, if_origin_mode ) {
    // Define the scaling of the axis
    left_scale = generate_numerical_scale(data, now_IVs[0], '#left-axis', d3.axisLeft,[axis_len, 0], if_origin_mode, true );
    bottom_scale = generate_numerical_scale(data, now_IVs[1], '#bottom-axis', d3.axisBottom, [0, axis_len], if_origin_mode, false );
    right_scale = generate_numerical_scale(data, now_IVs[2], '#right-axis', d3.axisRight, [0, axis_len], if_origin_mode, true );
    top_scale = generate_numerical_scale(data, now_IVs[3], '#top-axis', d3.axisTop, [axis_len, 0], if_origin_mode, false );

    // Plot the four corners of the axis
    d3.select('#axis-corner')
        .attr('d', coord_corner_data)
        .style('fill', 'none')
        .style('stroke', 'black');

    // Plot the axis titles
    generate_axis_title("#left-axis", now_IVs[0], true);
    generate_axis_title("#bottom-axis", now_IVs[1], false);
    generate_axis_title("#right-axis", now_IVs[2], true);
    generate_axis_title("#top-axis", now_IVs[3], false);
}

function calculate_centroid( point_list ) {
    let xsum = point_list.reduce((sum, curr_point) => sum + curr_point[0], 0);
    let ysum = point_list.reduce((sum, curr_point) => sum + curr_point[1], 0);

    return [xsum/point_list.length, ysum/point_list.length];
}

function generate_polygons( data, now_IVs, now_DV ) {
    for (let i = 0; i < data.length; i++) {
        let curr_data_entry = data[i];
        let curr_point_list = data_entry_to_point_list(curr_data_entry, now_IVs);
        polygons.push( { id: i,
                         color: color_scale(curr_data_entry[now_DV]),
                         depVal: curr_data_entry[now_DV],
                         points: point_list_to_path_str(curr_point_list),
                         centroid: calculate_centroid(curr_point_list)
        });
    }
}

function data_entry_to_point_list( data_entry, now_IVs ) {
    return [
        [axis_translation["#left-axis"][0], axis_translation["#left-axis"][1] + left_scale(data_entry[now_IVs[0]])],
        [axis_translation["#bottom-axis"][0] + bottom_scale(data_entry[now_IVs[1]]), axis_translation["#bottom-axis"][1]],
        [axis_translation["#right-axis"][0], axis_translation["#right-axis"][1] + right_scale(data_entry[now_IVs[2]])],
        [axis_translation["#top-axis"][0] + top_scale(data_entry[now_IVs[3]]), axis_translation["#top-axis"][1]]
    ]
}

export function point_list_to_path_str( point_list ){
    return point_list.map(p => p.join(',')).join(' ');
}

export function path_str_to_point_list( path_str ) {
    return path_str.split(" ").map(point => point.split(","));
}

function build_color_scale( data, now_DV, color_scheme ) {
    if ( color_scheme.length === 2 ) {
        color_scale = d3.scaleLinear()
            .domain(get_min_and_max(data, now_DV))
            .range(color_scheme);
    }
    else if ( color_scheme.length > 2 ) {
        // calculate pivots for multicolor scale
        let range_list = get_min_and_max(data, now_DV);
        let num_interval = (range_list[1]-range_list[0]) / (color_scheme.length-1);
        let check_points = [];
        for (let i = range_list[0]; i < range_list[1]+1; ) {
            check_points.push(i)
            i+=num_interval;
        }
        // console.log(check_points);
        color_scale = d3.scaleLinear()
            .domain(check_points)
            .range(color_scheme);
    }
    else {
        throw new Error("Invalid colorscale!");
    }
}

function plot_colorscale( data, now_DV ) {
    let depend_var_range = get_min_and_max( data, now_DV );
    let colorscale_data = d3.range(depend_var_range[0], depend_var_range[1], (depend_var_range[1]-depend_var_range[0])/100);
    let depend_var_scale = d3.scaleLinear()
        .domain(depend_var_range)
        .range([0, coord_len]);
    let colorscale_axis = d3.axisTop(depend_var_scale);

    // Plot the colorscale
    d3.selectAll('.colorscale').attr('opacity', 1);

    d3.select("#colorscale-content")
        .selectAll('rect')
        .data(colorscale_data)
        .join('rect')
        .attr('x', function(d) { return depend_var_scale(d); })
        .attr('width', 5)
        .attr('height', 15)
        .style('fill', function(d) { return color_scale(d); });

    // Plot the colorscale axis
    d3.select("#colorscale-axis").call(colorscale_axis);
    d3.select('#colorscale-axis>text').text(now_DV);
}

export function plot_polygons( canvas_id, polygon_data, inspected_index, if_color_block_mode ) {
    // Plot polygons to the canvas
    d3.select(canvas_id)
        .selectAll('polygon')
        .data(polygon_data)
        .join('polygon')
        .attr('points', function(d) { return d.points } )
        .attr('fill', function(d, i) { return if_color_block_mode ? d.color : (i === inspected_index ? '#FFF' : 'none') })
        .attr('stroke', function(d) { return if_color_block_mode ? '#FFF' : d.color })
        .attr('stroke-width', if_color_block_mode ? 0.0 : 1.5)
        .attr('stroke-opacity', function(d, i) { return (inspected_index !== null) ? (i === inspected_index ? 1.0 : 0.3 ) : 1.0 ; })
        .attr('fill-opacity', function(d, i) { return (inspected_index !== null) ? (i === inspected_index ? 1.0 : 0.3 ) : 0.3 ; })
        .classed('highlight-stroke', false);

    d3.select(canvas_id)
        .selectAll('polygon')
        .each(function(d, i) {
            if (i === inspected_index) {
                // Move the inspected polygon to front
                this.parentNode.appendChild(this);

                d3.select(this.parentNode)
                    .insert('polygon', () => this)
                    .attr('points', d.points)
                    .attr('fill', 'none')
                    .attr('stroke', 'white')
                    .attr('stroke-width', if_color_block_mode ? 3 : 6)
                    .attr('class', 'highlight-stroke')
            }});
}

function plot_axis_indicator( pcc_data, if_PCC ) {
    let axis_orients = ["left", "bottom", "right", "top"];

    for (let i = 0; i < axis_orients.length; i++) {
        let axis_orient = axis_orients[i];
        if ( if_PCC ) {
            let curr_indicator_info = axis_indicator_info[axis_orient];
            let curr_pcc = pcc_data[i];
            d3.select("#"+axis_orient+"-indicator")
                .attr("x", curr_indicator_info["x"])
                .attr("y", curr_indicator_info["y"])
                .attr("width", curr_indicator_info["width"])
                .attr("height", curr_indicator_info["height"])
                .attr("fill", curr_pcc >= 0 ? "#d8315b" : "#3e92cc")
                .attr("opacity", Math.abs(curr_pcc));
            d3.select("#"+axis_orient+"-indicator>title")
                .text("PCC Value = "+curr_pcc.toFixed(5));
        } else {
            d3.select("#"+axis_orient+"-indicator").attr("opacity",0);
            d3.select("#"+axis_orient+"-indicator>title")
                .text("");
        }
    }
}

export function plot_centroids( id, polygon_data, if_centroids, inspected_index, if_color_block_mode ){
    if ( if_centroids ) {
        d3.select(id)
            .selectAll('circle')
            .each(function(d, i) {
                if (i === inspected_index) {
                    // Move the inspected centroid to front
                    this.parentNode.appendChild(this);
                }})
            .data(polygon_data)
            .join('circle')
            .attr('cx', function(d){ return d.centroid[0]; })
            .attr('cy', function(d){ return d.centroid[1] })
            .attr('r', function(d, i) { return (inspected_index !== null) ? (i === inspected_index ? 4.5 : 3.5 ) : 3.5 ; })
            .attr('stroke', '#FFF')
            .attr('stroke-width', function(d, i) { return (if_color_block_mode) ? 1.0 : ( inspected_index !== null ? (i === inspected_index ? 1.0 : 0.0 ) : 0.0) ; })
            .attr('opacity', function(d, i) { return (inspected_index !== null) ? (i === inspected_index ? 1.0 : 0.4 ) : 1.0 ; })
            .attr('fill', function(d){ return d.color; });

        d3.select(id)
            .selectAll('circle')
            .each(function(d, i) {
                if (i === inspected_index) {
                    // Move the inspected centroid to front
                    this.parentNode.appendChild(this);
                }});
    } else {
        d3.select(id)
            .selectAll('circle')
            .attr('opacity', 0);
    }
}

function compute_origin( now_IVs, now_origin, set_origin ) {
    let origin_data = Object.fromEntries( now_IVs.map(varname => [varname, 0]) );
    let origin_point_list = data_entry_to_point_list(origin_data, now_IVs);
    let origin_polygon = {
        points: point_list_to_path_str(origin_point_list),
        centroid: calculate_centroid(origin_point_list),
    };
    if ( !isEqual(now_origin, origin_polygon) ) {
        set_origin(origin_polygon);
    }
    return origin_polygon;
}

export function plot_origin( origin_data, class_name, if_centroids, if_color_block_mode ) {
    d3.selectAll("."+class_name).selectAll("*").remove();
    d3.select("#"+class_name+"-polygon")
        .append('polygon')
        .attr('points', origin_data.points)
        .attr('fill', 'none')
        .attr('opacity', 1.0)
        .attr('stroke-dasharray', 4)
        .style('stroke', 'black')
        .style('stroke-width', 2);

    d3.select("#"+class_name+"-centroid")
        .append('rect')
        .attr('x', origin_data.centroid[0]-3)
        .attr('y', origin_data.centroid[1]-3)
        .attr('width', 6)
        .attr('height', 6)
        .attr('fill', 'black')
        .attr('opacity', if_centroids ? 0.8 : 0.0)
        .attr('stroke', '#FFF')
        .attr('stroke-width', if_color_block_mode ? 1.0 : 0.0);
}

function cursor_track(e, centroid_quadtree, set_inspected_index, inspected_index) {
    let cursor_pos = d3.pointer(e, this);
    let centroid = centroid_quadtree.find(cursor_pos[0], cursor_pos[1], 5);
    if (centroid !== inspected_index)
        centroid ? set_inspected_index(centroid.id) : set_inspected_index(null);
    // console.log("Now tracking...");
}

function get_datapoint_info( data, index, now_IVs ) {
    let info = [];
    for (let i = 0; i < 4; i++) {
        info.push(now_IVs[i]+": "+data[index][now_IVs[i]]);
    }
    return info;
}

function update_tooltip( data, inspected_index, now_IVs, if_color_block_mode ) {
    d3.select('#data-tooltip-text').selectAll('tspan').remove();
    if (inspected_index !== null) {
        // Add info about the specific data entry into the tooltip
        let pos = [polygons[inspected_index].centroid[0], polygons[inspected_index].centroid[1]];
        d3.select('#data-tooltip-text')
            .attr("x", pos[0]+16)
            .attr("y", pos[1])
            .selectAll('tspan')
            .data(get_datapoint_info( data, inspected_index, now_IVs ))
            .enter()
            .append('tspan')
            .attr('x', pos[0]+16)
            .attr('dy', (d, i) => i === 0 ? '0em' : '1.2em')
            .text(d => d);

        // Reshape the tooltip box to adapt for the text bounding box
        let text_bbox = document.getElementById('data-tooltip-text').getBBox();
        d3.select('#data-tooltip rect')
            .attr('rx', 5)
            .attr('x', text_bbox.x-5)
            .attr('y', text_bbox.y-5)
            .attr('width', text_bbox.width + 10)
            .attr('height', text_bbox.height + 10)
            .attr('stroke', if_color_block_mode ? '#edf2f4' : polygons[inspected_index].color)
            .attr('stroke-width', 2.0)
            .attr('fill', '#FFF');

        // Add the triangle to create a speech bubble shape
        let tri_point_list = [[pos[0]+12, pos[1]-5], [pos[0]+12, pos[1]+5], [pos[0]+6.5, pos[1]]];
        d3.select('#data-tooltip polygon')
            .attr('points', point_list_to_path_str(tri_point_list))
            .attr('fill', if_color_block_mode ? '#FFF' : polygons[inspected_index].color)
            .attr('stroke-width', 0.0);
        d3.select("#data-tooltip").attr('opacity', 1.0);
    } else {
        d3.select("#data-tooltip").attr('opacity', 0.0);
    }
}

export default function drawJCS( data, now_IVs, now_DV, now_polygon_data, set_polygon_data, size, color_scheme,
                                 if_PCC, if_centroids, if_origin_mode, now_origin, set_origin, if_color_block_mode,
                                 if_inspect_mode, set_inspected_index, inspected_index ) {
    // Reset global variables and event listeners:
    polygons = [];
    centroid_quadtree = d3.quadtree();

    coord_len = size;
    corner_len = coord_len * 0.05;
    axis_len = coord_len - 2 * corner_len;

    coord_corner_data = line_generator([
        [jcs_origin[0], jcs_origin[1]], [jcs_origin[0], jcs_origin[1]-corner_len], [jcs_origin[0]+corner_len, jcs_origin[1]-corner_len], null,
        [jcs_origin[0]+coord_len-corner_len, jcs_origin[1]-corner_len], [jcs_origin[0]+coord_len, jcs_origin[1]-corner_len], [jcs_origin[0]+coord_len, jcs_origin[1]], null,
        [jcs_origin[0]+coord_len, jcs_origin[1]+coord_len-corner_len*2], [jcs_origin[0]+coord_len, jcs_origin[1]+coord_len-corner_len], [jcs_origin[0]+coord_len-corner_len, jcs_origin[1]+coord_len-corner_len], null,
        [jcs_origin[0]+corner_len, jcs_origin[1]+coord_len-corner_len], [jcs_origin[0], jcs_origin[1]+coord_len-corner_len], [jcs_origin[0], jcs_origin[1]+coord_len-corner_len*2], null
    ]);

    axis_translation = {
        "#left-axis": [jcs_origin[0], jcs_origin[1]],
        "#top-axis": [jcs_origin[0]+corner_len, jcs_origin[1]-corner_len],
        "#right-axis": [jcs_origin[0]+coord_len, jcs_origin[1]],
        "#bottom-axis": [jcs_origin[0]+corner_len, jcs_origin[1]+coord_len-corner_len]
    }

    axis_indicator_info = {
        "left": {"x": jcs_origin[0]-10, "y": jcs_origin[1]-20, "width": 40, "height": coord_len},
        "top": {"x": jcs_origin[0], "y": jcs_origin[1]-30, "width": coord_len, "height": 40},
        "right": {"x": jcs_origin[0]+coord_len-30, "y": jcs_origin[1]-20, "width": 40, "height": coord_len},
        "bottom": {"x": jcs_origin[0], "y": jcs_origin[1]+coord_len-50, "width": coord_len, "height": 40}
    }

    // Plot the background:
    d3.select("#coord-background")
        .attr("x", jcs_origin[0])
        .attr("y", jcs_origin[1]-corner_len)
        .attr("width", coord_len)
        .attr("height", coord_len)
        .style("fill", '#fff');

    // Plot the axis:
    generate_axis( data, now_IVs, if_origin_mode );

    // Plot the colorscale:
    build_color_scale(data, now_DV, color_scheme );
    plot_colorscale(data, now_DV );

    // Plot the data as polygons:
    generate_polygons( data, now_IVs, now_DV );
    plot_polygons( '#polygon-data', polygons, inspected_index, if_color_block_mode );
    if ( !isEqual(polygons, now_polygon_data) ) {
        set_polygon_data( polygons );
    }

    // Calculate and plot correlation indicators if needed:
    let pcc_data = []
    if ( if_PCC ) {
        pcc_data = calculate_PCC_for_dataset( data, now_IVs, now_DV );
    }
    plot_axis_indicator( pcc_data, if_PCC );

    // Plot the centroids of polygons if needed:
    plot_centroids( "#centroid-indicators", polygons, if_centroids, inspected_index, if_color_block_mode );

    // Plot the origin if origin mode is on:
    if ( if_origin_mode ) {
        let origin_polygon = compute_origin( now_IVs, now_origin, set_origin, if_origin_mode )
        plot_origin( origin_polygon, "origin", if_centroids, if_color_block_mode );
    } else {
        d3.selectAll(".origin").selectAll("*").attr("opacity", 0);
    }

    // For inspection mode:
    d3.select('#joint-coordinate-canvas').on('mousemove', null);
    if (if_inspect_mode) {
        centroid_quadtree.x(d => d.x).y(d => d.y)
            .addAll([...polygons.map(polygon => ( { x: polygon.centroid[0], y: polygon.centroid[1], id: polygon.id } ))]);
        d3.select('#joint-coordinate-canvas').on('mousemove', (e) => cursor_track(e, centroid_quadtree, set_inspected_index, inspected_index));
        update_tooltip( data, inspected_index, now_IVs, if_color_block_mode);
    }
}