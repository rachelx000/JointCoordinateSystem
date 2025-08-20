import Plotly from 'plotly.js-dist';
import * as THREE from 'three';
import * as d3 from 'd3';
import {get_axis_range, plot_polygons, point_list_to_path_str, unpack} from "./JCS.js";
import {compute_area} from "./AnalysisPanel/PolygonAlignment.js";
import {isEqual} from "lodash";
import {project_4D_to_3D} from "./GeometryVis.js";
import MLR from "ml-regression-multivariate-linear";
import {formatMLREquation} from "./AnalysisPanel/ShapeAnalysis.js";
import regression from "regression";


const scatter_width = 255, scatter_height = 105;

export function drawPCP( data, curr_IVs, curr_DV, if_origin_mode, color_scheme ) {
    // Reference: https://plotly.com/javascript/parallel-coordinates-plot/
    function generate_colorscale( color_scheme ) {
        let interval = 1.0 / (color_scheme.length - 1);
        let colorscale_list = [];
        for (let i = 0; i < color_scheme.length; i++) {
            colorscale_list.push([Math.min(i*interval, 1.0), color_scheme[i]]);
        }
        return colorscale_list;
    }

    function get_colorscale_info() {
        let data_DV = unpack(data, curr_DV);
        let [if_log, unique_data, data_range] = get_axis_range( data, curr_DV );
        if ( if_log === "log10" && !if_origin_mode ) {
            data_range = [0, 1].map(i => Math.log10(data_range[i]));
            let tick_values = [];
            for (let i = 0; i < unique_data.length; i++) {
                tick_values.push(data_range[0]+i);
            }
            let ticks = unique_data.map(d3.format(".0e"));

            return {
                showscale: true,
                color: data_DV.map(d => d === 0 ? data_range[0] : Math.log10(d)),
                colorscale: generate_colorscale(color_scheme),
                cmin: data_range[0],
                cmax: data_range[1],
                colorbar: {
                    orientation: 'h',
                    x: 0.5,
                    xanchor: 'center',
                    y: -0.2,
                    yanchor: 'top',
                    title: { text: curr_DV+' (log)', side: 'right' },
                    tickvals: tick_values,
                    ticktext: ticks
                }
            }
        } else {
            return {
                showscale: true,
                color: data_DV,
                colorscale: generate_colorscale(color_scheme),
                colorbar: {
                    orientation: 'h',
                    x: 0.5,
                    xanchor: 'center',
                    y: -0.2,
                    yanchor: 'top',
                    title: { text: curr_DV, side: 'right' }
                }
            }
        }
    }

    let pcp_data = [
        {
            type: 'parcoords',
            reorderable: false,
            line: get_colorscale_info(),
            dimensions: [0, 1, 2, 3].map(index => {
                let curr_IV = curr_IVs[index];
                let [if_log, unique_data, data_range] = get_axis_range( data, curr_IV );
                let values = unpack(data, curr_IV);
                if ( if_log === "log10" && if_origin_mode === false ) {
                    data_range = [0, 1].map(i => Math.log10(data_range[i]));
                    let tick_values = [];
                    for (let i = 0; i < unique_data.length; i++) {
                        tick_values.push(data_range[0]+i);
                    }
                    let ticks = unique_data.map(d3.format(".0e"));
                    return {
                        range: data_range,
                        label: curr_IV+" (log)",
                        values: values.map(d => d === 0 ? data_range[0] : Math.log10(d)),
                        tickvals: tick_values,
                        ticktext: ticks
                    }
                } else {
                    if ( if_origin_mode ) {
                        if ( Math.abs(data_range[0]) >= data_range[1] )
                            data_range = [data_range[0], Math.abs(data_range[0])];
                        else
                            data_range = [-data_range[1], data_range[1]];
                    }
                    return {
                        range: data_range,
                        label: curr_IV,
                        values: values
                    }
            }})
        },
    ];

    let layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 100, r: 100, t: 100, b: 50 }
    };

    // Add black reference line if origin mode is on
    if (if_origin_mode) {
        let origin_data = [
            {
                type: 'parcoords',
                reorderable: false,
                line: {
                    color: [0, 1],
                    colorscale: [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0)']], // transparent
                    showscale: true,
                    colorbar: {
                        orientation: 'h',
                        x: 0.5,
                        xanchor: 'center',
                        y: -0.2,
                        yanchor: 'top',
                        title: {
                            text: curr_DV,
                            font: { color: 'rgba(0,0,0,0)' }
                        },
                        tickfont: { color: 'rgba(0,0,0,0)' },
                        bgcolor: 'rgba(0,0,0,0)',
                        outlinewidth: 0 }
                },
                dimensions: [0, 1, 2, 3].map(index => {
                    let curr_IV = curr_IVs[index];
                    let [, , data_range] = get_axis_range(data, curr_IV);
                    if (Math.abs(data_range[0]) >= data_range[1])
                        data_range = [data_range[0], Math.abs(data_range[0])];
                    else
                        data_range = [-data_range[1], data_range[1]];
                    return {
                        range: data_range,
                        label: curr_IV,
                        labelfont: { color: 'none' },
                        tickvals: [],
                        ticktext: [],
                        values: [0, 0]
                    };
                })
            }];

        Plotly.purge('pcp-container');
        Plotly.newPlot('pcp-container', pcp_data, layout, { staticPlot: true,  displayModeBar: true} );
        Plotly.newPlot('origin-container', origin_data, layout, { displayModeBar: false, staticPlot: true });
    } else {
        Plotly.purge('pcp-container');
        Plotly.purge('origin-container');
        Plotly.newPlot('pcp-container', pcp_data, layout, { staticPlot: true } );
    }

}

export function drawSpider( data, curr_IVs, curr_DV, color_scheme, now_spider_polygons, set_spider_polygons, set_origin_polygon,
                            if_color_block_mode, if_origin_mode, inspected_index, radius=135, levels=5 ) {
    let center = [radius+120, radius+20];
    let spiderPolygons = [];

    const axis_translation = {
        "#spider-axes>#left-axis": [center[0], center[1]],
        "#spider-axes>#top-axis": [120, center[1]],
        "#spider-axes>#right-axis": [center[0], 20],
        "#spider-axes>#bottom-axis": [center[0], center[1]],
        "#spider-colorscale": [600, 10]
    }

    // Plot the rader grid
    d3.select("#spider-grid").selectAll("circle").remove();
    for (let level = 1; level <= levels; level++) {
        const curr_radius = radius * (level / levels);
        d3.select("#spider-grid")
            .append("circle")
            .attr("cx", center[0])
            .attr("cy", center[1])
            .attr("r", curr_radius)
            .attr("fill", "none")
            .attr("stroke", "#ccc");
    }

    function generate_scale(data, varname, id, axis_generator, axis_range, if_vertical, if_reverse) {
        let [if_log, unique_data, data_range] = get_axis_range( data, varname );
        let scale, axis;

        if (if_log && !if_origin_mode) {
            if (!unique_data.includes(0)) {
                unique_data.unshift(0);
                data_range[0] = data_range[0]/10;
            }
            data_range = if_vertical ? data_range.reverse() : data_range;
            scale = d3.scaleLog().base(10).clamp(true)
                .domain(data_range)
                .range(if_reverse ? [radius, 0] : [0, radius])
                .nice();
            axis = axis_generator(scale)
                .tickValues(unique_data)
                .tickFormat(d3.format(".0e"));
        } else {
            if ( if_origin_mode ) {
                if (Math.abs(data_range[0]) >= data_range[1])
                    data_range = [data_range[0], Math.abs(data_range[0])];
                else
                    data_range = [-data_range[1], data_range[1]];
            }
            data_range = if_vertical ? data_range.reverse() : data_range;
            scale = d3.scaleLinear()
                .domain(data_range)
                .range(if_reverse ? [radius, 0] : [0, radius])
                .nice();
            axis = axis_generator(scale).ticks(5);
        }

        d3.select(id)
            .attr("transform", "translate("+axis_translation[id][0]+","+axis_translation[id][1]+")")
            .call(axis);

        // Remove the tick for the origin
        if (if_vertical && !if_log) {
            let all_ticks = d3.select(id).selectAll("g").nodes();
            let last_tick = all_ticks[all_ticks.length - 1];
            d3.select(last_tick).remove();
        } else {
            d3.select(id).select("g").remove()
        }

        return scale;
    }

    // Plot the axes
    let top_scale = generate_scale(data, curr_IVs[0], '#spider-axes>#top-axis', d3.axisTop, false, true);
    let left_scale = generate_scale(data, curr_IVs[1], '#spider-axes>#left-axis', d3.axisLeft, true, false);
    let bottom_scale = generate_scale(data, curr_IVs[2], '#spider-axes>#bottom-axis', d3.axisBottom, false, false);
    let right_scale = generate_scale(data, curr_IVs[3], '#spider-axes>#right-axis', d3.axisRight, true, true);


    function generate_axis_title(axis_id, axis_title, if_vertical) {
        let axis_selector = d3.select(axis_id + "-title");
        if (!if_vertical) {
            axis_selector.selectAll("tspan").remove();  // clear existing text
            let words = axis_title.split(" ");
            // Split the axis title into multiple lines if it contains multiple words
            words.forEach((word, i) => {
                axis_selector.append("tspan")
                    .text(word)
                    .attr('x', 0)
                    .attr('fill', '#000')
                    .attr('dy', i === 0 ? '0em' : '1.2em');
            });

            // Apply translation:
            if (axis_id.includes('top'))
                axis_selector.attr('transform', "translate(" + -30 + "," + (-axis_selector.node().getBBox().height*0.5) + ")");
            else
                axis_selector.attr('transform', "translate(" + (radius+25) + "," + (-axis_selector.node().getBBox().height*0.5) + ")");
        }
        else {
            axis_selector.text(axis_title).attr('fill', '#000');
            if ( axis_id.includes('left') )
                axis_selector.attr('transform', "translate("+ (axis_selector.node().getBBox().width*0.5) + "," + (radius+15)+")");
            else
                axis_selector.attr('transform', "translate("+ (-axis_selector.node().getBBox().width*0.5) + ", -10)");
        }
    }

    // Plot the axis title
    generate_axis_title('#spider-axes #top-axis', curr_IVs[0], false);
    generate_axis_title('#spider-axes #left-axis', curr_IVs[1], true);
    generate_axis_title('#spider-axes #bottom-axis', curr_IVs[2], false);
    generate_axis_title('#spider-axes #right-axis', curr_IVs[3], true);


    function build_color_scale( data, now_DV, color_scheme ) {
        // Check if the logarithmic scale is needed and generate the corresponding scale
        let [if_log, unique_data, data_range] = get_axis_range( data, now_DV );
        let color_interpolator = d3.interpolateRgbBasis(color_scheme);

        let scale_0_to_1 = (if_log === "log10") ? d3.scaleLog().domain(data_range).range([0, 1]).clamp(true) :
            d3.scaleLinear().domain(data_range).range([0, 1]).clamp(true);

        let color_scale = d => color_interpolator(scale_0_to_1(d));

        return [color_scale, if_log, data_range, unique_data];
    }

    // Plot the colorscale
    let [color_scale, colorscale_if_log, colorscale_range, colorscale_ticks] = build_color_scale( data, curr_DV, color_scheme );
    let depend_var_scale, colorscale_axis, colorscale_data;
    if ( colorscale_if_log === "log10" ) {
        depend_var_scale = d3.scaleLog()
            .domain(colorscale_range)
            .range([0, 280])
            .clamp(true);
        colorscale_axis = d3.axisRight(depend_var_scale)
            .tickValues(colorscale_ticks).tickFormat(d3.format(".0e"));
        colorscale_data = d3.range(Math.log10(colorscale_range[0]), Math.log10(colorscale_range[1]), (Math.log10(colorscale_range[1])-Math.log10(colorscale_range[0]))/100);
    } else {
        depend_var_scale = d3.scaleLinear()
            .domain(colorscale_range)
            .range([0, 280])
            .clamp(true);
        colorscale_axis = d3.axisRight(depend_var_scale);
        colorscale_data = d3.range(colorscale_range[0], colorscale_range[1], (colorscale_range[1]-colorscale_range[0])/40);
    }

    d3.select("#spider-colorscale-content")
        .selectAll('rect')
        .data(colorscale_data.filter(d => {
            let x = colorscale_if_log === "log10" ? depend_var_scale(10 ** d) : depend_var_scale(d);
            return x < 280;
        }))
        .join('rect')
        .attr('y', function(d) { return colorscale_if_log === "log10" ? depend_var_scale(10**d) : depend_var_scale(d); })
        .attr('height', 7)
        .attr('width', 15)
        .attr("transform", "translate("+axis_translation["#spider-colorscale"][0]+","+axis_translation["#spider-colorscale"][1]+")")
        .style('fill', function(d) { return colorscale_if_log === "log10" ? color_scale(10**d) : color_scale(d); });

    // Plot the colorscale axis
    d3.select("#spider-colorscale-axis")
        .attr("transform", "translate("+(axis_translation["#spider-colorscale"][0]+15)+","+axis_translation["#spider-colorscale"][1]+")")
        .call(colorscale_axis);
    let colorscale_title = d3.select('#spider-colorscale-axis>text')
        .text(curr_DV)
        .attr("fill", "#000");
    colorscale_title.attr("transform", "translate("+(-colorscale_title.node().getBBox().width)+",-2.5)");

    // Generate polygon data
    function data_entry_to_point_list( data_entry ) {
        return [
            [axis_translation["#spider-axes>#top-axis"][0] + top_scale(data_entry[curr_IVs[0]]), axis_translation["#spider-axes>#top-axis"][1]],
            [axis_translation["#spider-axes>#left-axis"][0], axis_translation["#spider-axes>#left-axis"][1] + left_scale(data_entry[curr_IVs[1]])],
            [axis_translation["#spider-axes>#bottom-axis"][0] + bottom_scale(data_entry[curr_IVs[2]]), axis_translation["#spider-axes>#bottom-axis"][1]],
            [axis_translation["#spider-axes>#right-axis"][0], axis_translation["#spider-axes>#right-axis"][1] + right_scale(data_entry[curr_IVs[3]])],
        ];
    }

    for (let i = 0; i < data.length; i++) {
        let curr_data_entry = data[i];
        let curr_point_list = data_entry_to_point_list(curr_data_entry);
        spiderPolygons.push( { id: i,
            color: color_scale(curr_data_entry[curr_DV]),
            depVal: curr_data_entry[curr_DV],
            points: point_list_to_path_str(curr_point_list),
            area: compute_area(curr_point_list)
        });
    }
    if ( !isEqual(spiderPolygons, now_spider_polygons) ) {
        set_spider_polygons(spiderPolygons);
    }

    // Plot polygons to the canvas
    function plotPolygonData() {
        plot_polygons( '#spider-polygons', spiderPolygons, inspected_index, if_color_block_mode );
    }
    plotPolygonData();

    function updateView() {
        plotPolygonData();
    }

    // Generate and plot origin polygon if needed
    function plotOriginPolygon() {
        if (if_origin_mode) {
            let origin_data = Object.fromEntries( curr_IVs.map(varname => [varname, 0]) );
            let origin_point_list = data_entry_to_point_list(origin_data, curr_IVs);
            let origin_polygon = {
                points: point_list_to_path_str(origin_point_list),
                area: compute_area(origin_point_list)
            };
            set_origin_polygon(origin_polygon);

            d3.select("#spider-origin")
                .attr('points', origin_polygon.points)
                .attr('fill', 'none')
                .attr('stroke-dasharray', 4)
                .style('stroke', 'black')
                .style('stroke-width', 2)
                .style('opacity', 1.0);
        } else {
            set_origin_polygon(null);
            d3.select("#spider-origin").style('opacity', 0.0);
        }
    }
    plotOriginPolygon();

    return {
        updateInspectedIndex: (new_index) => {
            inspected_index = new_index;
            updateView();
        },
        updateColorBlockMode: (now_if_color_block) => {
            if_color_block_mode = now_if_color_block;
            updateView();
        },
        updateOriginMode: (now_if_origin_mode) => {
            if_origin_mode = now_if_origin_mode;
            plotOriginPolygon();
        }
    };
}

export function sortPolygonsByDepVarVal( polygon_data ) {
    let depVal_list = polygon_data.map((polygon) => [ polygon.depVal, polygon.id ]);
    depVal_list.sort((a, b) => a[0] - b[0]);
    return depVal_list.map(item => item[1]);
}

export function plotScatterForArea( scatter_id, polygons, sorted_polygon_order, if_inspect_mode,
                                    inspected_index, set_inspected_index, if_origin_mode, origin ) {
    let zoom_k = 1;
    // Obtain the array of metric data
    let metric_data = polygons.map(polygon => polygon.area);

    // Generate and plot two axes
    let x_scale = d3.scaleLinear()
        .domain([0, metric_data.length])
        .range([40, scatter_width+40])
        .nice();
    let x_axis = d3.axisBottom(x_scale).ticks( Math.min(metric_data.length, 10) );
    let x_axis_group = d3.select('#'+scatter_id+'-x-axis');
    x_axis_group
        .call(x_axis)
        .attr("transform", "translate(0, "+scatter_height+")");
    let y_scale = d3.scaleLinear()
        .domain([Math.min(Math.floor(Math.min(...metric_data)-0.0001), 0), Math.ceil(Math.max(...metric_data)+0.0001)])
        .range([scatter_height, 5])
        .nice();
    let y_axis = d3.axisLeft(y_scale).ticks(5);
    let y_axis_group = d3.select('#'+scatter_id+'-y-axis');
    y_axis_group
        .call(y_axis)
        .attr("transform", "translate(40, 0)");

    d3.select('#'+scatter_id+'-data')
        .selectAll('circle')
        .data(sorted_polygon_order)
        .join('circle')
        .attr('cx', function(d, i){ return x_scale(i); })
        .attr('cy', function(d){ return y_scale(polygons[d].area); })
        .attr('r', 4 )
        .attr('stroke', function(d) { return polygons[d].id === inspected_index ? '#FFF' : 'none'; })
        .attr('stroke-width', 1.0 )
        .style('fill', function(d){ return polygons[d].color; });

    function updateView() {
        d3.select('#' + scatter_id + '-data')
            .selectAll('circle')
            .attr('r', d => (polygons[d].id === inspected_index) ? (5 / zoom_k) : (4 / zoom_k))
            .attr('stroke', d => (polygons[d].id === inspected_index) ? '#FFF' : 'none')
            .attr('stroke-width', 1.0 / zoom_k )
            .attr('opacity', d => (inspected_index !== null) ? (polygons[d].id === inspected_index ? 1.0 : 0.4) : 1.0);

        // Move inspected point to front
        d3.select('#' + scatter_id + '-data')
            .selectAll('circle')
            .each(function (d) {
                if (polygons[d].id === inspected_index) {
                    this.parentNode.appendChild(this);
                }
            });

        d3.select("#"+scatter_id+"-trend-info #line")
            .style('stroke-width', 1.0 / zoom_k );
    }

    function setInspect() {
        if (if_inspect_mode) {
            d3.select('#'+scatter_id+'-data')
                .selectAll('circle')
                .on('mouseover', (e, d) => {
                    inspected_index = polygons[d].id;
                    set_inspected_index(polygons[d].id);
                })
                .on('mouseout', () => {
                    set_inspected_index(null);
                });
        } else {
            d3.select('#'+scatter_id+'-data')
                .selectAll('circle')
                .on('mouseover', null)
                .on('mouseout', null);
        }
    }
    setInspect();

    function plotOrigin() {
        if (if_origin_mode && origin) {
            d3.select('#'+scatter_id+'-origin')
                .attr('x1', x_scale(0))
                .attr('y1', y_scale(origin.area))
                .attr('x2', x_scale(metric_data.length))
                .attr('y2', y_scale(origin.area))
                .attr('stroke', 'black')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', 4)
                .style('opacity', 1);
        } else {
            d3.select('#'+scatter_id+'-origin')
                .style('opacity', 0)
        }
    }
    plotOrigin();

    let scatter_zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[-50, -50], [350, 200]])
        .on('zoom', (e) => {
            zoom_k = e.transform.k;
            d3.selectAll("."+scatter_id+"-scatterplot")
                .attr('transform', e.transform);
            x_axis_group.call(x_axis.scale(e.transform.rescaleX(x_scale)));
            y_axis_group.call(y_axis.scale(e.transform.rescaleY(y_scale)));
            updateView();
        });
    d3.select("#"+scatter_id+" svg").call(scatter_zoom);

    return {
        xScale: x_scale,
        yScale: y_scale,
        updateInspectedIndex: (new_index) => {
            inspected_index = new_index;
            updateView();
        },
        updateInspectMode: (now_inspect_mode) => {
            if_inspect_mode = now_inspect_mode;
            setInspect();
        },
        updateOriginMode: (now_origin_mode) => {
            if_origin_mode = now_origin_mode;
            updateView();
        },
        updateOrigin: (now_origin) => {
            origin = now_origin;
            plotOrigin();
            updateView();
        },
        resetZoomPan: () => {
            d3.select("#" + scatter_id + " svg")
                .transition()
                .duration(500)
                .call(scatter_zoom.transform, d3.zoomIdentity);
        },
    };

}

export function fitEquationForArea( curr_IVs, data, polygons ) {
    let indep_data = [];
    for (let i = 0; i < polygons.length; i++) {
        let curr_data = data[i];
        let curr_data_list = [0, 1, 2, 3].map(j => curr_data[curr_IVs[j]]);
        indep_data.push(curr_data_list);
    }

    let dep_data = [];
    for (let i = 0; i < polygons.length; i++) {
        let curr_polygon = polygons[i];
        dep_data.push([curr_polygon.area]);
    }

    let mlr = new MLR(indep_data, dep_data);
    return formatMLREquation(mlr, curr_IVs, 'area');
}

export function plotScatterForAreaCorr( scatter_id, now_DV, data, polygons, sorted_polygon_order, if_inspect_mode, inspected_index, set_inspected_index ) {
    let zoom_k = 1;
    // Obtain the array of metric data
    let metric_data = polygons.map(polygon => polygon.area);
    let dv_data = unpack( data, now_DV );

    // Generate and plot two axes
    let [if_log, unique_data, dv_range] = get_axis_range( data, now_DV );
    let x_scale = (if_log === "log10") ? d3.scaleLog().base(10).clamp(true).domain(dv_range).range([45, scatter_width+45]).nice()
        : d3.scaleLinear().domain(dv_range).range([45, scatter_width+45]).nice();
    let x_axis = (if_log === "log10") ? d3.axisBottom(x_scale).tickValues(unique_data).tickFormat(d3.format(".0e"))
        : d3.axisBottom(x_scale).ticks( Math.min(metric_data.length, 10) );
    let x_axis_group = d3.select('#'+scatter_id+'-x-axis');
    x_axis_group
        .call(x_axis)
        .attr("transform", "translate(0, "+scatter_height+")");

    let y_scale = d3.scaleLinear()
        .domain([Math.min(Math.floor(Math.min(...metric_data)-0.0001), 0), Math.ceil(Math.max(...metric_data)+0.0001)])
        .range([scatter_height, 5])
        .nice();
    let y_axis = d3.axisLeft(y_scale).ticks(5);
    let y_axis_group = d3.select('#'+scatter_id+'-y-axis');
    y_axis_group
        .call(y_axis)
        .attr("transform", "translate(45, 0)");

    // Plot axis titles
    let x_axis_title_selector = d3.select('#'+scatter_id+'-x-title');
    let y_axis_title_selector = d3.select('#'+scatter_id+'-y-title');
    x_axis_title_selector.text(now_DV).style('font-size', 11).style('text-anchor', 'middle');
    y_axis_title_selector.text(scatter_id).style('font-size', 11).style("writing-mode", 'sideways-lr').style('text-anchor', 'middle');
    x_axis_title_selector.attr('transform', 'translate('+(scatter_width*0.5+30)+', '+(scatter_height+25)+')');
    y_axis_title_selector.attr('transform', 'translate(11.5'+','+(scatter_height*0.5)+')');

    d3.select('#'+scatter_id+'-data')
        .selectAll('circle')
        .data(sorted_polygon_order)
        .join('circle')
        .attr('cx', function(d){ return x_scale(dv_data[d]); })
        .attr('cy', function(d){ return y_scale(polygons[d].area); })
        .attr('r', 4 )
        .attr('stroke', function(d) { return polygons[d].id === inspected_index ? '#FFF' : 'none'; })
        .attr('stroke-width', 1.0 )
        .style('fill', function(d){ return polygons[d].color; });

    function updateView() {
        d3.select('#'+scatter_id+'-data')
            .selectAll('circle')
            .attr('r', d => (polygons[d].id === inspected_index) ? (5 / zoom_k) : (4 / zoom_k))
            .attr('stroke', d => (polygons[d].id === inspected_index) ? '#FFF' : 'none')
            .attr('stroke-width', 1.0 / zoom_k )
            .attr('opacity', d => (inspected_index !== null) ? (polygons[d].id === inspected_index ? 1.0 : 0.4) : 1.0);

        // Move inspected point to front
        d3.select('#'+scatter_id+'-data')
            .selectAll('circle')
            .each(function (d) {
                if (polygons[d].id === inspected_index) {
                    this.parentNode.appendChild(this);
                }
            });

        d3.select("#"+scatter_id+"-trend-info #line")
            .style('stroke-width', 1.0 / zoom_k );
    }

    function setInspect() {
        if (if_inspect_mode) {
            d3.select('#'+scatter_id+'-data')
                .selectAll('circle')
                .on('mouseover', (e, d) => {
                    inspected_index = polygons[d].id;
                    set_inspected_index(polygons[d].id);
                })
                .on('mouseout', () => {
                    set_inspected_index(null);
                });
        } else {
            d3.select('#'+scatter_id+'-data')
                .selectAll('circle')
                .on('mouseover', null)
                .on('mouseout', null);
        }
    }
    setInspect();

    let scatter_zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[-50, -50], [350, 200]])
        .on('zoom', (e) => {
            zoom_k = e.transform.k;
            d3.selectAll("."+scatter_id+"-scatterplot")
                .attr('transform', e.transform);
            x_axis_group.call(x_axis.scale(e.transform.rescaleX(x_scale)));
            y_axis_group.call(y_axis.scale(e.transform.rescaleY(y_scale)));
            updateView();
        });
    d3.select("#"+scatter_id+" svg").call(scatter_zoom);

    return {
        xScale: x_scale,
        yScale: y_scale,
        updateInspectedIndex: (new_index) => {
            inspected_index = new_index;
            updateView();
        },
        updateInspectMode: (now_inspect_mode) => {
            if_inspect_mode = now_inspect_mode;
            setInspect();
        },
        resetZoomPan: () => {
            d3.select("#" +scatter_id+ " svg")
                .transition()
                .duration(500)
                .call(scatter_zoom.transform, d3.zoomIdentity);
        },
    };
}

export function computeTrendForArea( polygons ) {
    let scatter_data = [];
    for (let i = 0; i < polygons.length; i++) {
        let curr_polygon = polygons[i];
        scatter_data.push([i, curr_polygon.area]);
    }

    let poly_reg_result = regression.polynomial(scatter_data, { order: 2 });
    let r2 = poly_reg_result.r2;
    if (isNaN(r2) || r2 === -Infinity || r2 === Infinity) {
        r2 = "NA";
    }
    return { points: poly_reg_result.points, equation: poly_reg_result.string, r2: r2 };
}

export function computeTrendForAreaCorr( polygons ) {
    let scatter_data = [];
    for (let i = 0; i < polygons.length; i++) {
        let curr_polygon = polygons[i];
        scatter_data.push([curr_polygon.depVal, curr_polygon.area]);
    }

    // preprocess to collapse duplicates by x
    let grouped = {};
    scatter_data.forEach(([x, y]) => {
        if (!grouped[x]) grouped[x] = [];
        grouped[x].push(y);
    });
    let average = Object.entries(grouped).map(([x, ys]) => {
        const avg_y = ys.reduce((a, b) => a + b, 0) / ys.length;
        return [Number(x), avg_y];
    });

    let poly_reg_result = regression.polynomial(average, { order: 2 });
    let r2 = poly_reg_result.r2;
    if (isNaN(r2) || r2 === -Infinity || r2 === Infinity) {
        r2 = "NA";
    }

    function fittedTrend(x) {
        return poly_reg_result.equation[0] * x ** 2 + poly_reg_result.equation[1] * x + poly_reg_result.equation[2];
    }
    let points = average.map(avg => [avg[0], fittedTrend(avg[0])]);

    return { points: points, equation: poly_reg_result.string, r2: r2 };
}

const axis_points = [
    // inner cube bottom layer
    [-1, -1, -1, -1],
    [1, -1, -1, -1],
    [-1, 1, -1, -1],
    [1, 1, -1, -1],
    // inner cube upper layer
    [-1, -1, 1, -1],
    [1, -1, 1, -1],
    [-1, 1, 1, -1],
    [1, 1, 1, -1],
    // outer cube bottom layer
    [-1, -1, -1, 1],
    [1, -1, -1, 1],
    [-1, 1, -1, 1],
    [1, 1, -1, 1],
    // outer cube upper layer
    [-1, -1, 1, 1],
    [1, -1, 1, 1],
    [-1, 1, 1, 1],
    [1, 1, 1, 1],
];

export function generateHypercubeScales( data, curr_IVs, curr_DV, color_scheme, if_origin_mode ) {
    let hypercube_scales = {};
    let hypercube_axis_ticks = {};

    // Generate scales for independent variablea
    curr_IVs.forEach( curr_IV => {
        let [if_log, unique_data, data_range] = get_axis_range( data, curr_IV );
        let scale, ticks;

        if ( if_origin_mode ) {
            if ( Math.abs(data_range[0]) >= data_range[1] )
                data_range = [data_range[0], Math.abs(data_range[0])];
            else
                data_range = [-data_range[1], data_range[1]];
        }

        if ( if_log === "log10" && if_origin_mode === false ) {
            scale = d3.scaleLog().base(10).clamp(true).domain(data_range).range([-0.9, 0.9]).nice();
            ticks = unique_data;
        }
        else {
            scale = d3.scaleLinear().domain(data_range).range([-0.9, 0.9]).nice();
            ticks = scale.ticks(5);
        }

        hypercube_scales[curr_IV] = scale;
        hypercube_axis_ticks[curr_IV] = ticks;
    })

    return [hypercube_scales, hypercube_axis_ticks];
}

function create_line_between_points( v1, v2, axis_group, color="white" ) {
    const vector1 = new THREE.Vector3(v1[0], v1[1], v1[2]);
    const vector2 = new THREE.Vector3(v2[0], v2[1], v2[2]);

    // Compute the direction and length between two points
    const direction = new THREE.Vector3().subVectors(vector2, vector1);
    const length = direction.length();
    direction.normalize();

    // Create a rod for the line
    const line_geometry = new THREE.CylinderGeometry(0.03, 0.03, length, 16);
    const line_material = new THREE.MeshPhongMaterial({ color: color });
    const line = new THREE.Mesh(line_geometry, line_material);

    // Set the position of rod as the midpoint between v1 and v2
    const midpoint = new THREE.Vector3().addVectors(vector1, vector2).multiplyScalar(0.5);
    line.position.copy(midpoint);

    // Align the line along the direction of (v2 - v1)
    const line_axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(line_axis, direction);
    line.quaternion.copy(quaternion);
    axis_group.add(line);
}

function clean_group( group ) {
    group.children.forEach(child => {
        child.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        });
    });
    group.clear();
}

export function generateHypercubeAxes( axis_group, rotation_matrix=null ) {
    // Clean previously generated axes
    if (axis_group.children.length > 0) { clean_group(axis_group) };
    let projected_axis_points = [];
    for (let i = 0; i < 16; i++) {
        let projected_point = project_4D_to_3D(axis_points[i], rotation_matrix);
        projected_axis_points.push(projected_point);
    }

    // Add axis lines with ticks by connecting these projected_points
    // Axis 0 (x-axis)
    for (let i = 0, j = 0; i < 8; i++){
        create_line_between_points( projected_axis_points[j], projected_axis_points[j+1], axis_group );
        j += 2;
    }

    // Axis 1 (y-axis: vertical lines between upper and lower layers for a cube)
    for (let i = 0, j = 0; i < 8; i++){
        create_line_between_points( projected_axis_points[j], projected_axis_points[j+2], axis_group );
        if ((j % 4) === 1) { j += 3; }
        else { j++; }
    }

    // Axis 2 (z-axis)
    for (let i = 0; i < 12; i++){
        create_line_between_points( projected_axis_points[i], projected_axis_points[i+4], axis_group );;
        if (i === 3) { i += 4; }
    }

    // Axis 3 (w-axis: connecting lines between outer and inner cubes)
    for (let i = 0; i < 8; i++){
        create_line_between_points( projected_axis_points[i], projected_axis_points[i+8], axis_group );
    }
}

function get_scale_domain_and_type( scale ) {
    let range = scale.domain();
    let type;
    if (typeof scale.base === "function") {
        type = "log";
    }
    if (typeof scale.ticks === "function") {
        type = "linear";
    }
    return [range, type];
}

function create_ticks_for_axis( v1, axis_id, axis_ticks, axis_ticks_group, scale, color = "white" ) {
    const [data_range, scale_type] = get_scale_domain_and_type(scale);
    const tick_geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const tick_material = new THREE.MeshStandardMaterial( { color: color } );

    for (let i = 0; i < axis_ticks.length; i++) {
        let tick_pos = JSON.parse(JSON.stringify(v1));
        let curr_tick = axis_ticks[i];
        if (scale_type === "log") {
            tick_pos[axis_id] = curr_tick === 0 ? scale(data_range[0]) : scale(curr_tick);
        } else {
            tick_pos[axis_id] = scale(curr_tick);
        }
        let projected_tick = project_4D_to_3D(tick_pos);
        let tick_mesh = new THREE.Mesh(tick_geometry, tick_material);
        tick_mesh.position.set(...projected_tick);
        tick_mesh.userData.originPos = tick_pos;
        axis_ticks_group.add(tick_mesh);
    }
}

export function generateHypercubeAxesTicks( axis_ticks, axis_ticks_group, curr_IVs, scales ) {
    if (axis_ticks_group.children.length > 0) { clean_group(axis_ticks_group) };

    // Axis 0 (x-axis)
    for (let i = 0, j = 0; i < 8; i++){
        create_ticks_for_axis( axis_points[j], 0, axis_ticks[curr_IVs[0]], axis_ticks_group, scales[curr_IVs[0]] );
        j += 2;
    }

    // Axis 1 (y-axis: vertical lines between upper and lower layers for a cube)
    for (let i = 0, j = 0; i < 8; i++){
        create_ticks_for_axis( axis_points[j], 1, axis_ticks[curr_IVs[1]], axis_ticks_group, scales[curr_IVs[1]] );
        if ((j % 4) === 1) { j += 3; }
        else { j++; }
    }

    // Axis 2 (z-axis)
    for (let i = 0; i < 12; i++){
        create_ticks_for_axis( axis_points[i], 2, axis_ticks[curr_IVs[2]], axis_ticks_group, scales[curr_IVs[2]] );
        if (i === 3) { i += 4; }
    }

    // Axis 3 (w-axis: connecting lines between outer and inner cubes)
    for (let i = 0; i < 8; i++) {
        create_ticks_for_axis(axis_points[i], 3, axis_ticks[curr_IVs[3]], axis_ticks_group, scales[curr_IVs[3]] );
    }
}

export function update4DRotationHypercube( mesh, indicator, inspected_index, rotation_matrix ) {
    // Update hypercube axis:
    if (mesh.axisGroup.children.length > 0) {
        generateHypercubeAxes(mesh.axisGroup, rotation_matrix);
    }

    // Update hypercube axis ticks:
    if (mesh.axisTicksGroup.children.length > 0) {
        let tick_meshes = mesh.axisTicksGroup.children;
        for (let i = 0; i < tick_meshes.length; i++) {
            let tick_mesh = tick_meshes[i];
            let pos_4D = tick_mesh.userData.originPos;
            let pos_3D = project_4D_to_3D(pos_4D, rotation_matrix);
            tick_mesh.position.set(...pos_3D);
        }
    }

    // Update hypercube datapoints:
    if (mesh.dataGroup.children.length > 0) {
        let data_meshes = mesh.dataGroup.children;
        for (let i = 0; i < data_meshes.length; i++) {
            let data_mesh = data_meshes[i];
            let pos_4D = data_mesh.userData.originPos;
            let pos_3D = project_4D_to_3D(pos_4D, rotation_matrix);
            data_mesh.position.set(...pos_3D);
        }
    }

    // Update indicator position if exists
    if (indicator !== null && inspected_index !== null) {
        const vertex_4D = mesh.dataGroup.children[inspected_index].userData.originPos;
        const vertex_3D = project_4D_to_3D(vertex_4D, rotation_matrix);
        indicator.position.set(...vertex_3D);
    }
}

export function generateHypercubeData( data, now_polygon_data, data_group, curr_IVs, curr_DV, scales ) {
    if (data_group.children.length > 0) { clean_group(data_group); }
    const point_geometry = new THREE.SphereGeometry(0.08, 8, 8);

    function get_value_from_scale( input_val, scale ) {
        let [data_range, scale_type] = get_scale_domain_and_type(scale);
        if (scale_type === "log") {
            return input_val === 0 ? scale(data_range[0]) : scale(input_val);
        } else {
            return scale(input_val);
        }
    }
    // Iteratively project the data into the hypercube coordinate
    for (let i = 0; i < data.length; i++) {
        let datapoint = [];
        let curr_data = data[i];
        for (let j = 0; j < 4; j++) {
            let curr_IV = curr_IVs[j];
            let curr_scale = scales[curr_IV];
            let curr_val = get_value_from_scale(curr_data[curr_IV], curr_scale)
            datapoint.push(curr_val);
        }
        let projected_datapoint = project_4D_to_3D(datapoint);
        let point_material = new THREE.MeshStandardMaterial( { color: now_polygon_data[i].color } );
        let point = new THREE.Mesh(point_geometry, point_material);
        point.userData.originPos = datapoint;
        point.position.set( projected_datapoint[0],  projected_datapoint[1],  projected_datapoint[2] );
        data_group.add(point);
    }
}