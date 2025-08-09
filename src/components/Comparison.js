import { get_axis_range, plot_polygons, point_list_to_path_str, unpack } from "./JCS.js";
import Plotly from 'plotly.js-dist';
import * as d3 from 'd3';
import { compute_area } from "./AnalysisPanel/PolygonAlignment.js";
import { isEqual } from "lodash";

const scatter_width = 280, scatter_height = 110;

export function drawPCP( data, curr_IVs, curr_DV, color_scheme ) {
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
        if ( if_log === "log10" ) {
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
                    title: { text: curr_DV, side: 'right' }
                }
            }
        }
    }

    let pcp_data = [
        {
            type: 'parcoords',
            line: get_colorscale_info(),
            dimensions: [0, 1, 2, 3].map(index => {
                let curr_IV = curr_IVs[index];
                let [if_log, unique_data, data_range] = get_axis_range( data, curr_IV );
                let values = unpack(data, curr_IV);
                if ( if_log === "log10" ) {
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
                    return {
                        range: data_range,
                        label: curr_IV,
                        values: values
                    }
            }})
        },
    ];

    Plotly.newPlot('pcp-container', pcp_data);
}

export function drawSpider( data, curr_IVs, curr_DV, color_scheme, now_spider_polygons, set_spider_polygons,
                            if_color_block_mode, inspected_index, radius=135, levels=5 ) {
    let center = [radius+80, radius+20];
    let spiderPolygons = [];

    const axis_translation = {
        "#spider-axes>#left-axis": [center[0], center[1]],
        "#spider-axes>#top-axis": [80, center[1]],
        "#spider-axes>#right-axis": [center[0], 20],
        "#spider-axes>#bottom-axis": [center[0], center[1]],
        "#spider-colorscale": [500, 10]
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

    function generate_scale(data, varname, id, axis_generator, axis_range, if_vertical) {
        let [if_log, unique_data, data_range] = get_axis_range( data, varname );
        let scale, axis;

        if (if_log) {
            data_range = [0, 1].map(i => Math.log10(data_range[i]));
            data_range = if_vertical ? data_range.reverse() : data_range;
            scale = d3.scaleLog().base(10).clamp(true)
                .domain(data_range)
                .range(axis_range)
                .nice();
            axis = axis_generator(scale)
                .tickValues(unique_data)
                .tickFormat(d3.format(".0e"));
        } else {
            data_range = if_vertical ? data_range.reverse() : data_range;
            scale = d3.scaleLinear()
                .domain(data_range)
                .range(axis_range)
                .nice();
            axis = axis_generator(scale).ticks(5);
        }

        d3.select(id)
            .attr("transform", "translate("+axis_translation[id][0]+","+axis_translation[id][1]+")")
            .call(axis);

        // Remove the tick for the origin
        if (if_vertical) {
            let all_ticks = d3.select(id).selectAll("g").nodes();
            let last_tick = all_ticks[all_ticks.length - 1];
            d3.select(last_tick).remove();
        } else {
            d3.select(id).select("g").remove()
        }

        return scale;
    }

    // Plot the axes
    let left_scale = generate_scale(data, curr_IVs[0], '#spider-axes>#left-axis', d3.axisLeft, [radius, 0], true);
    let bottom_scale = generate_scale(data, curr_IVs[1], '#spider-axes>#bottom-axis', d3.axisBottom, [0, radius], false);
    let right_scale = generate_scale(data, curr_IVs[2], '#spider-axes>#right-axis', d3.axisRight, [0, radius], true);
    let top_scale = generate_scale(data, curr_IVs[3], '#spider-axes>#top-axis', d3.axisTop, [radius, 0], false);


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
                axis_selector.attr('transform', "translate(" + -25 + "," + (-axis_selector.node().getBBox().height*0.5) + ")");
            else
                axis_selector.attr('transform', "translate(" + (radius+20) + "," + (-axis_selector.node().getBBox().height*0.5) + ")");
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
    generate_axis_title('#spider-axes #left-axis', curr_IVs[0], true);
    generate_axis_title('#spider-axes #bottom-axis', curr_IVs[1], false);
    generate_axis_title('#spider-axes #right-axis', curr_IVs[2], true);
    generate_axis_title('#spider-axes #top-axis', curr_IVs[3], false);


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
            [axis_translation["#spider-axes>#left-axis"][0], axis_translation["#spider-axes>#left-axis"][1] + left_scale(data_entry[curr_IVs[0]])],
            [axis_translation["#spider-axes>#bottom-axis"][0] + bottom_scale(data_entry[curr_IVs[1]]), axis_translation["#spider-axes>#bottom-axis"][1]],
            [axis_translation["#spider-axes>#right-axis"][0], axis_translation["#spider-axes>#right-axis"][1] + right_scale(data_entry[curr_IVs[2]])],
            [axis_translation["#spider-axes>#top-axis"][0] + top_scale(data_entry[curr_IVs[3]]), axis_translation["#spider-axes>#top-axis"][1]]
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

    return {
        updateInspectedIndex: (new_index) => {
            inspected_index = new_index;
            updateView();
        },
        updateColorBlockMode: (now_if_color_block) => {
            if_color_block_mode = now_if_color_block;
            updateView();
        }
    };
}

export function sortPolygonsByDepVarVal( polygon_data ) {
    let depVal_list = polygon_data.map((polygon) => [ polygon.depVal, polygon.id ]);
    depVal_list.sort((a, b) => a[0] - b[0]);
    return depVal_list.map(item => item[1]);
}

export function plotScatterForArea( scatter_id, polygons, sorted_polygon_order, if_inspect_mode, inspected_index, set_inspected_index ) {
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
        updateInspectedIndex: (new_index) => {
            inspected_index = new_index;
            updateView();
        },
        updateInspectMode: (now_inspect_mode) => {
            if_inspect_mode = now_inspect_mode;
            setInspect();
        },
        resetZoomPan: () => {
            d3.select("#" + scatter_id + " svg")
                .transition()
                .duration(500)
                .call(scatter_zoom.transform, d3.zoomIdentity);
        },
    };

}