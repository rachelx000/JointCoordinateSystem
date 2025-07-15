import * as d3 from 'd3';

// Constant and Global Variables:
const coord_length = 400, scatter_width = 300, scatter_height=100;
const corner_length = coord_length * 0.05;
const axis_length = coord_length - 2*corner_length;
const jcs_origin = [100, 70];
let data_input;
let var_names;
let axis_orient = "1";
let left_scale, right_scale, top_scale, bottom_scale;
let color_scale;
let scale_color_list, scale_color_order;
let line_generator = d3.line().defined(function(d) {return d !== null; });
let color_block_mode_on = document.querySelector('#color_block_mode').checked;
let inspection_mode_on = document.querySelector('#inspection_mode').checked;
let origin_mode_on = document.querySelector('#origin_mode').checked;

// Global Data:
const axis_corner_data = line_generator([
    [jcs_origin[0], jcs_origin[1]], [jcs_origin[0], jcs_origin[1]-corner_length], [jcs_origin[0]+corner_length, jcs_origin[1]-corner_length], null,
    [jcs_origin[0]+coord_length-corner_length, jcs_origin[1]-corner_length], [jcs_origin[0]+coord_length, jcs_origin[1]-corner_length], [jcs_origin[0]+coord_length, jcs_origin[1]], null,
    [jcs_origin[0]+coord_length, jcs_origin[1]+coord_length-corner_length*2], [jcs_origin[0]+coord_length, jcs_origin[1]+coord_length-corner_length], [jcs_origin[0]+coord_length-corner_length, jcs_origin[1]+coord_length-corner_length], null,
    [jcs_origin[0]+corner_length, jcs_origin[1]+coord_length-corner_length], [jcs_origin[0], jcs_origin[1]+coord_length-corner_length], [jcs_origin[0], jcs_origin[1]+coord_length-corner_length*2], null
]);

const axis_translation = {
    "#left-axis": [jcs_origin[0], jcs_origin[1]],
    "#top-axis": [jcs_origin[0]+corner_length, jcs_origin[1]-corner_length],
    "#right-axis": [jcs_origin[0]+coord_length, jcs_origin[1]],
    "#bottom-axis": [jcs_origin[0]+corner_length, jcs_origin[1]+coord_length-corner_length]
}

const axis_indicator_info = {
    "left": {"x": jcs_origin[0]-10, "y": jcs_origin[1]-20, "width": 20, "height": coord_length},
    "top": {"x": jcs_origin[0], "y": jcs_origin[1]-30, "width": coord_length, "height": 20},
    "right": {"x": jcs_origin[0]+coord_length-10, "y": jcs_origin[1]-20, "width": 20, "height": coord_length},
    "bottom": {"x": jcs_origin[0], "y": jcs_origin[1]+coord_length-30, "width": coord_length, "height": 20}
}

let pearson_r_data;
let polygons = [];
let polygon_color = [];
let centroids = [];
let centroid_quadtree = d3.quadtree()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });
let hoveredIndex;
let sorted_polygon_indices;
let aligned_polygons;
let aligned_centroids;
let reference_value = {"sphericity": 0, "compactness": 0, "diagonal_ratio": 0, "angular_regularity": 0};

// Data Processing Functions:
function read_csv_data( filename, callback ) {
    d3.csv( filename ).then(function( data ) {
        data_input=data;
        // Check if the input data is valid
        if ( data_input ) {
            callback(data_input);
        }
    });
}

function get_variable_names( data ){
    var_names = [...new Set(data.flatMap(obj => Object.keys(obj)))];
    console.log(var_names);
}

function get_min_and_max( data, var_name ){
    let min = Math.min(...data.map(obj => obj[var_name]));
    let max = Math.max(...data.map(obj => obj[var_name]));
    return [min, max];
}

function pearson_r_calculation_for_csv( data ) {
    pearson_r_data = [];
    let y_data = data.map(obj => parseFloat(obj[var_names[var_names.length-1]]));

    for (let i = 0; i < var_names.length; i++ ) {
        let x_data = data.map(obj => parseFloat(obj[var_names[i]]));
        let curr_r = pearson_r_calculation( x_data, y_data );
        pearson_r_data.push(curr_r);
    }

    console.log("correlation coefficients:", pearson_r_data);
}

function pearson_r_calculation( x_data, y_data ) {
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

function plotting_axis_indicator() {
    let axis_orientations = ["left", "top", "right", "bottom"];

    for (let i = 0; i < axis_orientations.length; i++) {
        let axis_orient = axis_orientations[i];
        let curr_indicator_info = axis_indicator_info[axis_orient];
        let curr_r_val = pearson_r_data[i];
        d3.select("#"+axis_orient+"-indicator")
            .attr("x", curr_indicator_info["x"])
            .attr("y", curr_indicator_info["y"])
            .attr("width", curr_indicator_info["width"])
            .attr("height", curr_indicator_info["height"])
            .attr("fill", curr_r_val >= 0 ? "#FF4949" : "#0F4392")
            .attr("opacity", Math.abs(curr_r_val));
    }
}

function logarithmic_growth_check( data, var_name ) {
    let pearson_r, log;

    // filter and sort unique values from the input data array
    let unique_data = [...new Set([...data.map(obj => obj[var_name])])];
    unique_data.sort((a, b)=> a - b);

    let indices = [...Array(unique_data.length).keys()];

    // check if it is base-10 logarithmic growth
    let log10_data = unique_data.map((x) => Math.log10(x));

    // replace infinite vals and sort it in ascending order
    log10_data = log10_data.map((x) => (x === Infinity) || (x === -Infinity) ? 0 : x );
    log10_data.sort((a, b) => a - b);
    pearson_r = pearson_r_calculation(indices, log10_data);
    if (pearson_r > 0.999) { log = "log10"; }
    return [ log, unique_data ];
}

function generate_numerical_scale( data, var_name, id, axis_generator, axis_range, if_vertical ) {
    // Check if the logarithmic scale is needed and generate the corresponding scale
    let result = logarithmic_growth_check( data, var_name );
    let log = result[0];
    let unique_data = result[1];
    let scale;
    let data_range = get_min_and_max(data, var_name);

    if ( origin_mode_on ) {
        if ( Math.abs(data_range[0]) >= data_range[1] )
            data_range = [data_range[0], Math.abs(data_range[0])];
        else
            data_range = [-data_range[1], data_range[1]];
    }

    data_range = if_vertical ? data_range.reverse() : data_range;
    // DEBUG: console.log(data_range);
    // DEBUG: console.log(log);

    if ( log === "log10" && origin_mode_on === false ) {
        // Remove 0 to avoid conflicts with the d3 log-scale
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
    if ( log === "log10" && origin_mode_on === false ) {
        axis.tickValues(unique_data).tickFormat(d3.format(".0e"));
    }

    // Plot the scale region of the axis while applying the translation:
    d3.select(id).attr("transform", "translate("+axis_translation[id][0]+","+axis_translation[id][1]+")").call(axis);

    return scale;
}

function plotting_axis_title( axis_id, axis_title, if_vertical ) {
    let axis_selector = d3.select(axis_id + "-title");
    if (if_vertical) {
        // Apply translation:
        if ( axis_id === '#left-axis')
            axis_selector.attr('transform', "translate("+"-40"+","+axis_length*0.5+")");
        else
            axis_selector.attr('transform', "translate("+"40"+","+axis_length*0.5+")");

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
            axis_selector.attr('transform', "translate("+axis_length*0.5+","+"-35"+")");
        else
            axis_selector.attr('transform', "translate("+axis_length*0.5+","+"35"+")");
        axis_selector.text(axis_title);
    }
}

function plotting_axis( data ) {
    // Define the scaling of the axis
    let axis_range = [0, axis_length];
    if (axis_orient === "1")
        axis_range = [axis_length, 0];
    left_scale = generate_numerical_scale( data, var_names[0], '#left-axis', d3.axisLeft, axis_range,true );
    top_scale = generate_numerical_scale( data, var_names[1], '#top-axis', d3.axisTop, axis_range, false );
    if (axis_orient === "1")
        axis_range = [0, axis_length];
    right_scale = generate_numerical_scale( data, var_names[2], '#right-axis', d3.axisRight, axis_range,true );
    bottom_scale = generate_numerical_scale( data, var_names[3], '#bottom-axis', d3.axisBottom, axis_range, false );

    // Plot the four corners of the axis
    d3.select('#axis-corner')
        .attr('d', axis_corner_data)
        .style('fill', 'none')
        .style('stroke', 'black');

    // Plot the axis titles
    plotting_axis_title("#left-axis", var_names[0], true);
    plotting_axis_title("#top-axis", var_names[1], false);
    plotting_axis_title("#right-axis", var_names[2], true);
    plotting_axis_title("#bottom-axis", var_names[3], false);
}

function data_entry_to_polygon( data_entry, index ) {
    if (polygons.length < data_input.length) {
        let polygon_point_list = [
            [axis_translation["#left-axis"][0], axis_translation["#left-axis"][1]+left_scale(data_entry[var_names[0]])],
            [axis_translation["#top-axis"][0]+top_scale(data_entry[var_names[1]]), axis_translation["#top-axis"][1]],
            [axis_translation["#right-axis"][0], axis_translation["#right-axis"][1]+right_scale(data_entry[var_names[2]])],
            [axis_translation["#bottom-axis"][0]+bottom_scale(data_entry[var_names[3]]), axis_translation["#bottom-axis"][1]]
        ];
        polygons.push( polygon_point_list );

        // compute the centroid of the current polygon
        calculate_centroid( polygon_point_list, index );
        // convert list of points to a points string
        return point_list_to_path_str( polygon_point_list );
    }
    return point_list_to_path_str( polygons[index] );
}

function point_list_to_path_str( polygon_point_list ){
    return polygon_point_list.map(p => p.join(',')).join(' ');
}

function build_color_scale( data, depend_var_name ) {
    if ( scale_color_list.length === 2 ) {
        color_scale = d3.scaleLinear()
            .domain(get_min_and_max(data, depend_var_name))
            .range(scale_color_list);
    }
    else if ( scale_color_list.length > 2 ) {
        // calculate pivots for multicolor scale
        let range_list = get_min_and_max(data, depend_var_name);
        let num_interval = (range_list[1]-range_list[0]) / (scale_color_list.length-1);
        let check_points = [];
        for (let i = range_list[0]; i < range_list[1]+1; ) {
            check_points.push(i)
            i+=num_interval;
        }
        // console.log(check_points);
        color_scale = d3.scaleLinear()
            .domain(check_points)
            .range(scale_color_list);
    }
    else {
        throw new Error("Invalid colorscale!");
    }
}

function calculate_centroid( polygon_points, index ) {
    let xsum = polygon_points.reduce((sum, curr_point) => sum + curr_point[0], 0);
    let ysum = polygon_points.reduce((sum, curr_point) => sum + curr_point[1], 0);
    xsum /= polygon_points.length;
    ysum /= polygon_points.length;

    centroids.push({
        id: index,
        x: xsum,
        y: ysum,
        r: 4});
}

function plotting_centroid( id, data ){
    d3.select(id)
        .selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', function(d){ return d.x; })
        .attr('cy', function(d){ return d.y; })
        .attr('r', function(d){ return d.r; })
        .attr('stroke', '#FFF')
        .attr('stroke-width', color_block_mode_on ? 1 : 0)
        .attr('fill', function(d, i){ return polygon_color[i]; });
}

function plotting_polygons( data ) {
    d3.select('#polygon_data')
        .selectAll('polygon')
        .data(data)
        .join('polygon')
        .attr('points', function(d, i) { return data_entry_to_polygon(d, i); } )
        .attr('fill', 'none')
        .attr('stroke', function(d, i) {
            if ( polygon_color.length < data_input.length ) {
                let curr_color = color_scale(d[var_names[var_names.length-1]]);
                polygon_color.push(curr_color);
                return curr_color; } else { return polygon_color[i]; }
        })
        .attr('stroke-width', color_block_mode_on ? 0 : 2);

    if (color_block_mode_on) {
        d3.select('#polygon_data')
            .selectAll('polygon')
            .attr('fill', function(d, i) { return polygon_color[i]; })
            .attr('fill-opacity', 0.3);
    }
}

function cursor_track(e) {
    let cursor_pos = d3.pointer(e, this);
    let d = centroid_quadtree.find(cursor_pos[0], cursor_pos[1], 20);
    hoveredIndex = d ? d.id : null;
    // DEBUG: console.log(hoveredIndex);
    update_hovering( );
}

function inspection_opacity( i ) {
    if ( inspection_mode_on ) {
        return i === hoveredIndex ? 1.0 : 0.2;
    } else {
        return 1.0;
    }
}

function inspection_stroke_width( i ) {
    if ( inspection_mode_on ) {
        return i === hoveredIndex ? 1.5 : 0.0;
    } else {
        return 0.0;
    }
}

function inspection_radius( i ) {
    if ( inspection_mode_on ) {
        return i === hoveredIndex ? 5.0 : 4.0;
    } else {
        return 4.0;
    }
}

function update_shape_analysis_plots( id ) {
    d3.select(id)
        .selectAll('circle')
        .attr('r', function(d, i) { return inspection_radius( i ); })
        .style('stroke', "#EBE8E2")
        .style('stroke-width', function(d, i) { return inspection_stroke_width( i ); })
        .style('opacity', function(d, i) { return inspection_opacity( i ); });
}

function update_inspected_polygon( id, data ) {
    if ( hoveredIndex != null ) {
        d3.select(id)
            .attr('points', point_list_to_path_str(data[hoveredIndex]))
            .attr('fill', color_block_mode_on ? polygon_color[hoveredIndex] : 'none')
            .attr('stroke', color_block_mode_on ? '#FFF' : polygon_color[hoveredIndex])
            .attr('stroke-width', 2)
            .attr('opacity', 0.7);
    } else {
        d3.select(id)
            .attr('opacity', 0.0);
    }
}

function get_datapoint_info( index ) {
    let info = [];
    console.log(data_input);
    for (let i = 0; i < var_names.length; i++) {
        info.push(var_names[i]+": "+data_input[index][var_names[i]]);
    }
    return info;
}

function update_inspected_centroid( id, data ) {
    if ( hoveredIndex != null ) {
        d3.select(id)
            .attr('cx', data[hoveredIndex].x)
            .attr('cy', data[hoveredIndex].y)
            .attr('r', data[hoveredIndex].r)
            .attr('fill', polygon_color[hoveredIndex])
            .attr('stroke', color_block_mode_on ? '#FFF' : polygon_color[hoveredIndex])
            .attr('stroke-width', color_block_mode_on ? 1 : 0)
            .attr('opacity', 1.0);
        d3.select('#data-tooltip')
            .attr('opacity', 1.0);
        d3.select('#data-tooltip-text').selectAll('tspan').remove();
        d3.select('#data-tooltip-text')
            .attr("x", centroids[hoveredIndex].x+20)
            .attr("y", centroids[hoveredIndex].y)
            .selectAll('tspan')
            .data(get_datapoint_info( hoveredIndex ))
            .enter()
            .append('tspan')
            .attr('x', centroids[hoveredIndex].x+20)
            .attr('dy', (d, i) => i === 0 ? '0em' : '1.2em')
            .text(d => d);
        let text_bbox = document.getElementById('data-tooltip-text').getBBox();
        d3.select('#data-tooltip rect')
            .attr('x', text_bbox.x - 5)
            .attr('y', text_bbox.y - 5)
            .attr('width', text_bbox.width + 10)
            .attr('height', text_bbox.height + 10)
            .attr('stroke', color_block_mode_on ? '#FFF' : polygon_color[hoveredIndex]);
    } else {
        d3.select(id)
            .attr('opacity', 0.0);
        d3.select('#data-tooltip')
            .attr('opacity', 0.0);
    }
}

function update_hovering() {
    // Polygon with Centroids:
    d3.select('#polygon_data')
        .selectAll('polygon')
        .style('opacity', inspection_mode_on ? 0.3 : 1.0);
    update_inspected_polygon( "#inspected_polygon", polygons );

    d3.select('#centroid_indicators')
        .selectAll('circle')
        .style('opacity', inspection_mode_on ? 0.3 : 1.0);
    update_inspected_centroid( "#inspected_centroid", centroids );

    // Alignments:
    d3.select('#polygons-alignment')
        .selectAll('polygon')
        .style('opacity', inspection_mode_on ? 0.3 : 1.0);
    update_inspected_polygon( "#inspected_aligned_polygon", aligned_polygons );

    d3.select('#centroids_alignment')
        .selectAll('circle')
        .style('opacity', inspection_mode_on ? 0.3 : 1.0);
    update_inspected_centroid( "#inspected_aligned_centroid", aligned_centroids );

    // Shape Measurements:
    update_shape_analysis_plots( "#sphericity_data" );
    update_shape_analysis_plots( "#compactness_data" );
    update_shape_analysis_plots( "#diagonal_ratio_data" );
}

function polygon_inspection( ) {
    d3.select('#joint-coordinate-canvas').on('mousemove', inspection_mode_on ? cursor_track : null);
    d3.select('#data-tooltip').select('rect')
        .attr('width', '50px')
        .attr('height', '50px')
        .style('fill', '#FFF')
        .style('stroke-width', '1.5px');
    update_hovering();
}

function plotting_origin() {
    if ( origin_mode_on ) {
        let origin_point = new Array(4).fill(0);

        // plotting the origin polygon in the coordinate
        let origin_point_list = [
            [100, 100 + left_scale(origin_point[0])],
            [150 + top_scale(origin_point[1]), 50],
            [600, 100 + right_scale(origin_point[2])],
            [150 + bottom_scale(origin_point[3]), 550]
        ]
        d3.select('#reference_polygon')
            .append('polygon')
            .attr('points', point_list_to_path_str(origin_point_list))
            .attr('fill', 'none')
            .attr('stroke-dasharray', 4)
            .style('stroke', 'black')
            .style('stroke-width', 2);

        // plotting the origin's centroid
        let origin_centroid_x = origin_point_list.reduce((sum, curr_point) => sum + curr_point[0], 0);
        let origin_centroid_y = origin_point_list.reduce((sum, curr_point) => sum + curr_point[1], 0);
        origin_centroid_x /= origin_point_list.length;
        origin_centroid_y /= origin_point_list.length;
        d3.select('#reference_centroid')
            .append('rect')
            .attr('x', origin_centroid_x-4)
            .attr('y', origin_centroid_y-4)
            .attr('width', 8)
            .attr('height', 8)
            .attr('stroke', '#FFF')
            .attr('stroke-width', color_block_mode_on ? 1 : 0)
            .attr('fill', 'black');

        // plotting aligned origin polygon
        let [translation, aligned_origin] = align_single_polygon_at_a_corner(origin_point_list, 0.4);
        d3.select('#reference-alignment')
            .append('polygon')
            .attr('points', point_list_to_path_str(aligned_origin))
            .attr('fill', 'none')
            .attr('stroke-dasharray', 4)
            .style('stroke', 'black')
            .style('stroke-width', 2);
        d3.select("#reference_centroid_alignment")
            .append('rect')
            .attr('width', 8)
            .attr('height', 8)
            .attr('x', (origin_centroid_x-translation[0])*0.4-4)
            .attr('y', (origin_centroid_y-translation[1])*0.4-4)
            .attr('stroke', '#FFF')
            .attr('stroke-width', color_block_mode_on ? 1 : 0)
            .attr('fill', 'black');

        // plot reference lines for shape analysis
        let origin_sphericity = sphericity_calculation_for_single_polygon( origin_point_list );
        reference_value["sphericity"] = origin_sphericity;
        let origin_compactness = compactness_calculation_for_single_polygon( origin_point_list );
        reference_value["compactness"] = origin_compactness;
        let origin_diagonal_ratio = diagonal_ratio_calculation_for_single_polygon( origin_point_list );
        reference_value["diagonal_ratio"] = origin_diagonal_ratio;
    }
    else {
        document.getElementById('reference_polygon').innerHTML = '';
        document.getElementById('reference_centroid').innerHTML = '';
        document.getElementById('reference-alignment').innerHTML = '';
        document.getElementById('reference_centroid_alignment').innerHTML = '';
    }
}

function plotting_data( data ) {
    // reset the global lists
    centroids = [];
    polygon_color = [];
    polygons = [];
    sorted_polygon_indices = [];
    aligned_polygons = [];
    aligned_centroids = [];

    // generate the colorscale
    build_color_scale( data, var_names[var_names.length-1] );

    // compute and plot the polygons for data (with calculated centroids)
    // DEBUG: console.log("color_block_mode_on: ", color_block_mode_on);
    plotting_polygons( data );

    // plot the centroids
    plotting_centroid( "#centroid_indicators", centroids );
    // Update the quadtree for centroids
    // DEBUG: console.log("centroids", centroids);
    centroid_quadtree.addAll(centroids);
    // DEBUG: console.log("centroids quadtree", centroid_quadtree);

    // compute and plot the colorscale
    plotting_colorscale( data, var_names[var_names.length-1] );

    // compute and plot the alignment of polygons
    plotting_alignment( );

    // plotting origin if needed
    plotting_origin();
    console.log(reference_value);

    // compute and plot the shape measurements
    shape_analysis();

    d3.select("#color_block_mode").on("change", function() {
        color_block_mode_on = !color_block_mode_on;
        // DEBUG: console.log(color_block_mode_on);
        plotting_polygons( data );
        plotting_centroid( "#centroid_indicators", centroids );
        plotting_alignment( );
    });

    // toggle for displaying the centroid indicators
    polygon_inspection( false );    // reset the opacity control
    let centroid_display = document.querySelector('#centroid_display').checked;
    if (!centroid_display) {
        inspection_mode_on = false;
        document.getElementById("inspection_mode").checked = false;
        document.getElementById("inspection_mode").disabled = true;
        d3.selectAll("#centroids").attr("opacity", 0);
        d3.selectAll("#centroids-alignment").attr("opacity", 0);
        polygon_inspection( false );
    } else {
        document.getElementById("inspection_mode").disabled = false;
        polygon_inspection( );
    }

    d3.select("#centroid_display").on("change", function() {
        centroid_display = !centroid_display;
        if (centroid_display) {
            document.getElementById("inspection_mode").disabled = false;
            d3.selectAll("#centroids").attr("opacity", 1);
            d3.selectAll("#centroids-alignment").attr("opacity", 1);
            polygon_inspection( );
            d3.select("#inspection_mode").on("change", function() {
                inspection_mode_on = !inspection_mode_on;
                // console.log("inspection_mode_on:", inspection_mode_on);
                polygon_inspection( );
            });
        }
        else {
            inspection_mode_on = false;
            document.getElementById("inspection_mode").checked = false;
            document.getElementById("inspection_mode").disabled = true;
            d3.selectAll("#centroids").attr("opacity", 0);
            d3.selectAll("#centroids-alignment").attr("opacity", 0);
            polygon_inspection( false );
        }
    });
}

function plotting_colorscale( data, depend_var_name ) {
    let depend_var_range = get_min_and_max( data, depend_var_name );
    let colorscale_data = d3.range(depend_var_range[0], depend_var_range[1], (depend_var_range[1]-depend_var_range[0])/100);
    let depend_var_scale = d3.scaleLinear()
        .domain(depend_var_range)
        .range([coord_length, 0]);
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
    d3.select('#colorscale-axis>text').text(var_names[var_names.length - 1]);
}

function plotting_joint_coordinate( data ) {
    // Enable associated dropdown lists and checkboxes
    document.getElementById("color_scheme").disabled = false;
    document.getElementById("color_gradient").disabled = false;
    document.getElementById("correlation-display").disabled = false;
    // Uncheck all checkboxes
    document.getElementById("correlation-display").checked = false;
    let correlation_display = false;
    // reset centroid_quadtree
    centroid_quadtree = d3.quadtree()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

    // Plot the background:
    d3.select("#coord-background")
        .attr("x", jcs_origin[0])
        .attr("y", jcs_origin[1]-corner_length)
        .attr("width", coord_length)
        .attr("height", coord_length)
        .style("fill", '#fff');

    get_variable_names( data );
    plotting_axis( data );

    // Allows for switching between different axis orientation:
    axis_orient = document.querySelector('input[name="axis-orient"]:checked').value;
    d3.selectAll('input[name="axis-orient"]').on("change", function() {
        axis_orient = document.querySelector('input[name="axis-orient"]:checked').value;
        // DEBUG: console.log("axis orient:", axis_orient);
        plotting_axis( data );
        plotting_data( data );

    });

    // Allows for switching among different color schemes and gradients:
    scale_color_list = document.getElementById("color_scheme").value.split(',')
    scale_color_order = document.getElementById("color_gradient").value;
    scale_color_list = ( scale_color_order === "AB" ) ? scale_color_list : scale_color_list.reverse() ;
    plotting_data( data );

    d3.select("#color_scheme").on("change", function() {
        scale_color_list = this.value.split(',');
        scale_color_list = ( scale_color_order === "AB" ) ? scale_color_list : scale_color_list.reverse() ;
        plotting_data( data );
    });

    d3.select("#color_gradient").on("change", function() {
        scale_color_list = document.getElementById("color_scheme").value.split(',');
        scale_color_order = this.value;
        scale_color_list = ( scale_color_order === "AB" ) ? scale_color_list : scale_color_list.reverse() ;
        plotting_data( data );
    });

    // Display correlation indicators:
    pearson_r_calculation_for_csv( data );
    d3.selectAll(".correlation-indicator").attr("opacity", 0)
    d3.select("#correlation-display").on("change", function() {
        correlation_display = !correlation_display;
        // console.log(correlation_display);
        if (correlation_display) {
            plotting_axis_indicator();
        }
        else {
            d3.selectAll(".correlation-indicator").attr("opacity", 0)
        }
    });

    // Allows for switching to the view including the origin
    d3.select("#origin_mode").on("change", function() {
        origin_mode_on = !origin_mode_on;
        console.log("origin_mode_on:", origin_mode_on);
        plotting_axis( data );
        plotting_data( data );
    });
}

function plotting_alignment( ) {
    if (aligned_polygons.length === 0) {
        align_polygons_at_a_corner(polygons, 0.4);
    }

    // plot aligned polygons
    d3.select('#polygons-alignment')
        .selectAll('polygon')
        .data(aligned_polygons)
        .join('polygon')
        .attr('points', function(d) { return point_list_to_path_str(d); })
        .attr('stroke', function(d, i) { return polygon_color[i]; })
        .attr('stroke-width', color_block_mode_on ? 0 : 2)
        .attr('fill', function(d, i) { return polygon_color[i] })
        .attr('fill-opacity', color_block_mode_on ? 0.3 : 0.0 );

    // plot aligned centroids
    // DEBUG: console.log("aligned_centroids", aligned_centroids);
    plotting_centroid("#centroids_alignment", aligned_centroids);
}

function align_polygons_at_a_corner( polygon_data, scaling ) {
    let translation, translated_polygon;
    aligned_polygons = [];
    aligned_centroids = [];
    polygon_data.forEach((polygon, i) => {
            [translation, translated_polygon] = align_single_polygon_at_a_corner( polygon, scaling );
            aligned_polygons.push(translated_polygon);

            // apply the translation for the centroid of the polygon
            aligned_centroids.push({
                id: i,
                x: (centroids[i].x-translation[0])*scaling,
                y: (centroids[i].y-translation[1])*scaling,
                r: 4});
        }
    )
}

function align_single_polygon_at_a_corner( polygon, scaling ) {
    let bottom_left_v = polygon[0];
    let translate_x = bottom_left_v[0] - 0;
    let translate_y = bottom_left_v[1] - 0;

    // apply the translation for all points of the polygon
    let translated_polygon = [];
    let translation = [translate_x, translate_y];
    polygon.forEach((v) => {
            translated_polygon.push([(v[0]-translate_x)*scaling, (v[1]-translate_y)*scaling]);
        }
    )
    return [translation, translated_polygon];
}

function shape_analysis() {
    // calculate shape measurements
    let sphericity_result = sphericity_calculation( polygons );
    let diagonal_ratio_result = diagonal_ratio_calculation( polygons );
    let compactness_result = compactness_calculation( polygons );
    let angular_regularity_result = angular_regularity_calculation( polygons );
    console.log(angular_regularity_result);

    // sort polygons based on the angle of aligned centroids in increasing order
    let angle_list = aligned_centroids.map((centroid, i) => ({'angle':Math.atan(centroid[1]/centroid[0]), 'i':i}));
    angle_list.sort((a, b) => a.angle-b.angle);
    sorted_polygon_indices = angle_list.map((item) => (item.i));

    // plot the scatterplots for shape measurements
    let polygon_indices = [...Array(polygons.length).keys()]
    plotting_scatterplot( polygon_indices, sphericity_result, "#sphericity");
    plotting_scatterplot( polygon_indices, compactness_result, "#compactness" )
    plotting_scatterplot( polygon_indices, diagonal_ratio_result, "#diagonal_ratio");
    plotting_scatterplot( polygon_indices, angular_regularity_result, "#angular_regularity");
}

function plotting_scatterplot( x, y, id ) {
    console.log(reference_value);
    document.getElementById(id.slice(1)+'_reference').innerHTML = '';
    // generate and plot x-axis
    let x_axis = d3.scaleLinear()
        .domain([Math.min(...x), Math.max(...x)])
        .range([0, scatter_width])
        .nice();
    d3.select(id+'_x_axis').call(d3.axisBottom(x_axis));

    // generate and plot y-axis
    let y_axis = d3.scaleLinear()
        .domain([Math.floor(Math.min(...y)-0.1), Math.max(...y)+0.1])
        .range([scatter_height, 0])
        .nice()
    d3.select(id+'_y_axis').call(d3.axisLeft(y_axis));

    // generate and plot data
    d3.select(id+'_data')
        .selectAll('circle')
        .data(sorted_polygon_indices)
        .join('circle')
        .attr('cx', function(d, i){ return x_axis(i); })
        .attr('cy', function(d){ return y_axis(y[d]); })
        .attr('r', 4)
        .style('fill', function(d){ return polygon_color[d]; });

    if ( origin_mode_on ) {
        // generate and plot y-axis
        let y_axis = d3.scaleLinear()
            .domain([Math.floor(Math.min(Math.min(...y), reference_value[id.slice(1)])-0.1), Math.max(...y)+0.1])
            .range([scatter_height, 0])
            .nice()
        d3.select(id+'_y_axis').call(d3.axisLeft(y_axis));

        d3.select(id+'_data')
            .selectAll('circle')
            .data(sorted_polygon_indices)
            .join('circle')
            .attr('cx', function(d, i){ return x_axis(i); })
            .attr('cy', function(d){ return y_axis(y[d]); })
            .attr('r', 4)
            .style('fill', function(d){ return polygon_color[d]; });

        d3.select(id+'_reference')
            .append('line')
            .attr('x1', x_axis(Math.min(...x)))
            .attr('y1', y_axis(reference_value[id.slice(1)]))
            .attr('x2', x_axis(Math.max(...x)))
            .attr('y2', y_axis(reference_value[id.slice(1)]))
            .attr('stroke', 'black')
            .attr('stroke-dasharray', 4);
    }
    else {
        document.getElementById(id.slice(1)+'_reference').innerHTML = '';
    }
}

function sphericity_calculation( polygon_data ) {
    let cyclic_results = [];
    polygon_data.forEach((polygon) => {
        let sphericity = sphericity_calculation_for_single_polygon( polygon );
        cyclic_results.push(sphericity);
    });
    return cyclic_results;
}

function sphericity_calculation_for_single_polygon( polygon ) {
    let va, vb, vc, vd, ab, bc, cd, da, ac, bd, delta;
    va = polygon[0];
    vb = polygon[1];
    vc = polygon[2];
    vd = polygon[3];
    // DEB UG: console.log([va, vb, vc, vd]);

    // computed in 0-1 scale:
    ab = ((1.-(va[1]-50.)/coord_length)**2 + ((vb[0]-100.)/coord_length)**2)**0.5;
    bc = ((1.-(vb[0]-100.)/coord_length)**2 + (1.-(vc[1]-50.)/coord_length)**2)**0.5;
    cd = (((vc[1]-50.)/coord_length)**2 + (1.-(vd[0]-100.)/coord_length)**2)**0.5;
    da = (((vd[0]-100.)/coord_length)**2 + ((va[1]-50.)/coord_length)**2)**0.5
    ac = (1.**2+((va[1]-vc[1])/coord_length)**2)**0.5;
    bd = (1.**2+((vb[0]-vd[0])/coord_length)**2)**0.5;

    delta = ac*bd - (ab*cd+da*bc);

    return delta;
}

function compactness_calculation( polygon_data ) {
    let compactness_results = [];
    polygon_data.forEach((polygon) => {
        let compactness = compactness_calculation_for_single_polygon( polygon );
        compactness_results.push(compactness);
    });
    return compactness_results
}

function compactness_calculation_for_single_polygon( polygon ) {
    let va, vb, vc, vd, ab, bc, cd, da;
    let area1, area2, area3, area4, perimeter, polygon_area, compactness;
    va = polygon[0];
    vb = polygon[1];
    vc = polygon[2];
    vd = polygon[3];

    // computed in 0-1 scale:
    area1 = ((1. - (va[1]-50.) / coord_length) * ((vb[0]-100.) / coord_length)) / 2;
    area2 = ((1. - (vb[0]-100.) / coord_length) * (1. - (vc[1]-50.) / coord_length)) / 2;
    area3 = (((vc[1]-50.) / coord_length) * (1. - (vd[0]-100.) / coord_length)) / 2;
    area4 = (((vd[0]-100.) / coord_length) * ((va[1]-50.) / coord_length)) / 2;
    polygon_area = 1 - (area1 + area2 + area3 + area4);

    ab = ((1.-(va[1]-50.)/coord_length)**2 + ((vb[0]-100.)/coord_length)**2)**0.5;
    bc = ((1.-(vb[0]-100.)/coord_length)**2 + (1.-(vc[1]-50.)/coord_length)**2)**0.5;
    cd = (((vc[1]-50.)/coord_length)**2 + (1.-(vd[0]-100.)/coord_length)**2)**0.5;
    da = (((vd[0]-100.)/coord_length)**2 + ((va[1]-50.)/coord_length)**2)**0.5
    perimeter = ab + bc + cd + da;
    compactness = (perimeter ** 2) / (4 * Math.PI * polygon_area);
    return compactness;
}

function diagonal_ratio_calculation( polygon_data ) {
    let diagonal_ratio_results = [];
    polygon_data.forEach((polygon) => {
        let diagonal_ratio = diagonal_ratio_calculation_for_single_polygon(polygon);
        diagonal_ratio_results.push(diagonal_ratio);
    });
    return diagonal_ratio_results;
}

function diagonal_ratio_calculation_for_single_polygon( polygon ) {
    let va, vb, vc, vd, ac, bd, d;
    va = polygon[0];
    vb = polygon[1];
    vc = polygon[2];
    vd = polygon[3];

    // computed in 0-1 scale:
    ac = (1.**2+((va[1]-vc[1])/coord_length)**2)**0.5;
    bd = (1.**2+((vb[0]-vd[0])/coord_length)**2)**0.5;

    d = ac/bd;
    return d;
}

function compute_angle_between_points(p1, c, p2) {
    // compute two vectors for the angle
    let p1_c = [c[0]-p1[0], c[1]-p1[1]];
    let c_p2 = [c[0]-p2[0], c[1]-p2[1]];

    // dot product and lengths
    let dot_prod = p1_c[0]*c_p2[0] + p1_c[1]*c_p2[1];
    let p1_c_len = Math.hypot(p1_c[0], p1_c[1]);
    let c_p2_len = Math.hypot(c_p2[0], c_p2[1]);

    // compute angle
    let cos_theta = dot_prod / (p1_c_len * c_p2_len);
    cos_theta = Math.max(Math.min(cos_theta, 1), -1);

    return Math.acos(cos_theta)* (180 / Math.PI);
}

function angular_regularity_calculation( polygon_data ) {
    let angular_regularity_results = [];
    polygon_data.forEach((polygon) => {
        let angular_regularity = angular_regularity_calculation_for_single_polygon(polygon);
        angular_regularity_results.push(angular_regularity);
    });
    return angular_regularity_results;
}

function angular_regularity_calculation_for_single_polygon( polygon ) {
    let va, vb, vc, vd;
    va = polygon[0];
    vb = polygon[1];
    vc = polygon[2];
    vd = polygon[3];

    let angle_va = compute_angle_between_points(vd, va, vb);
    let angle_vb = compute_angle_between_points(va, vb, vc);
    let angle_vc = compute_angle_between_points(vb, vc, vd);
    let angle_vd = compute_angle_between_points(vc, vd, va);

    return Math.abs(angle_va-90)+ Math.abs(angle_vb-90) + Math.abs(angle_vc-90) + Math.abs(angle_vd-90);
}

function main() {
    // get current html file name
    read_csv_data( "/data/visualization_data/example/basic_elements.csv", plotting_joint_coordinate )

    // visualize example datasets:
    document.getElementById("example")
        .addEventListener("change", function(){
            if (window.myInterval) {                // remove other event listener
                clearInterval(window.myInterval);
                window.myInterval = null;
            }
            data_input=[];
            let curr_data = this.value;
            // DEBUG: console.log(curr_data);
            read_csv_data("data/visualization_data/" + curr_data + ".csv", plotting_joint_coordinate);
        });
}

main();