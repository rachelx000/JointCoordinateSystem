import * as d3 from "d3";
import MLR from "ml-regression-multivariate-linear";
import { regressionLoess } from 'd3-regression';
import { unpack, get_axis_range } from "../JCS.js";
import { sortPolygonsByDepVarVal } from "../Comparison.js";

const scatter_width = 255, scatter_height = 105;
const loess = regressionLoess()
    .x(d => d.x)
    .y(d => d.y)
    .bandwidth(0.3);

export function plotShapeMetric( metric_id, aligned_polygons, aligned_polygon_order, if_inspect_mode, inspected_index, set_inspected_index, aligned_origin_data ) {
    let zoom_k = 1;
    // Obtain the array of metric data
    let metric_data = aligned_polygons.map(polygon => polygon.metrics[metric_id]);

    // Generate and plot two axes
    let x_scale = d3.scaleLinear()
        .domain([0, metric_data.length])
        .range([45, scatter_width+45])
        .nice();
    let x_axis = d3.axisBottom(x_scale).ticks( Math.min(metric_data.length, 10) );
    let x_axis_group = d3.select('#'+metric_id+'-x-axis');
    x_axis_group
        .call(x_axis)
        .attr("transform", "translate(0, "+scatter_height+")");

    let y_scale = d3.scaleLinear()
        .domain([Math.min(Math.floor(Math.min(...metric_data)-0.0001), 0), Math.ceil(Math.max(...metric_data)+0.0001)])
        .range([scatter_height, 5])
        .nice();
    let y_axis = d3.axisLeft(y_scale).ticks(5);
    let y_axis_group = d3.select('#'+metric_id+'-y-axis');
    y_axis_group
        .call(y_axis)
        .attr("transform", "translate(45, 0)");

    // Plot axis titles
    let x_axis_title_selector = d3.select('#'+metric_id+'-x-title');
    let y_axis_title_selector = d3.select('#'+metric_id+'-y-title');
    x_axis_title_selector.text('order').style('font-size', 11).style('text-anchor', 'middle');
    y_axis_title_selector.text(metric_id).style('font-size', 11).style("writing-mode", 'sideways-lr').style('text-anchor', 'middle');
    x_axis_title_selector.attr('transform', 'translate('+(scatter_width*0.5+30)+', '+(scatter_height+25)+')');
    y_axis_title_selector.attr('transform', 'translate(11.5'+','+(scatter_height*0.5)+')');

    d3.select('#'+metric_id+'-data')
        .selectAll('circle')
        .data(aligned_polygon_order)
        .join('circle')
        .attr('cx', function(d, i){ return x_scale(i); })
        .attr('cy', function(d){ return y_scale(aligned_polygons[d].metrics[metric_id]); })
        .attr('r', 4 )
        .attr('stroke', function(d) { return aligned_polygons[d].id === inspected_index ? '#FFF' : 'none'; })
        .attr('stroke-width', 1.0 )
        .style('fill', function(d){ return aligned_polygons[d].color; });

    function updateView() {
        d3.select('#' + metric_id + '-data')
            .selectAll('circle')
            .attr('r', d => (aligned_polygons[d].id === inspected_index) ? (5 / zoom_k) : (4 / zoom_k))
            .attr('stroke', d => (aligned_polygons[d].id === inspected_index) ? '#FFF' : 'none')
            .attr('stroke-width', 1.0 / zoom_k )
            .attr('opacity', d => (inspected_index !== null) ? (aligned_polygons[d].id === inspected_index ? 1.0 : 0.4) : 1.0);

        // Move inspected point to front
        d3.select('#' + metric_id + '-data')
            .selectAll('circle')
            .each(function (d) {
                if (aligned_polygons[d].id === inspected_index) {
                    this.parentNode.appendChild(this);
                }
            });

        d3.select("#"+metric_id+"-trend-info #line-highlight")
            .style('stroke-width', 4.0 / zoom_k );

        d3.select("#"+metric_id+"-trend-info #line")
            .style('stroke-width', 2.0 / zoom_k );

        if (aligned_origin_data) {
            d3.select('#' + metric_id + '-origin')
                .attr('stroke-width', 2 / zoom_k);
        }
    }

    function setInspect() {
        if (if_inspect_mode) {
            d3.select('#'+metric_id+'-data')
                .selectAll('circle')
                .on('mouseover', (e, d) => {
                    inspected_index = aligned_polygons[d].id;
                    set_inspected_index(aligned_polygons[d].id);
                })
                .on('mouseout', () => {
                    set_inspected_index(null);
                });
        } else {
            d3.select('#'+metric_id+'-data')
                .selectAll('circle')
                .on('mouseover', null)
                .on('mouseout', null);
        }
    }
    setInspect();

    function plotOrigin() {
        if (aligned_origin_data) {
            d3.select('#'+metric_id+'-origin')
                .attr('x1', x_scale(0))
                .attr('y1', y_scale(aligned_origin_data.metrics[metric_id]))
                .attr('x2', x_scale(metric_data.length))
                .attr('y2', y_scale(aligned_origin_data.metrics[metric_id]))
                .attr('stroke', 'black')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', 4)
                .attr('opacity', 1);
        } else {
            d3.select('#'+metric_id+'-origin')
                .attr('opacity', 0)
        }
    }
    plotOrigin();

    let scatter_zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[-50, -50], [350, 200]])
        .on('zoom', (e) => {
            zoom_k = e.transform.k;
            d3.selectAll("."+metric_id+"-scatterplot")
                .attr('transform', e.transform);
            x_axis_group.call(x_axis.scale(e.transform.rescaleX(x_scale)));
            y_axis_group.call(y_axis.scale(e.transform.rescaleY(y_scale)));
            updateView();
        });
    d3.select("#"+metric_id+" svg").call(scatter_zoom);

    return {
        xScale: x_scale,
        yScale: y_scale,
        updateInspectedIndex: (new_index) => {
            inspected_index = new_index;
            updateView();
        },
        updateOrigin: (now_aligned_origin_data) => {
            aligned_origin_data = now_aligned_origin_data;
            plotOrigin();
            updateView();
        },
        updateInspectMode: (now_inspect_mode) => {
            if_inspect_mode = now_inspect_mode;
            setInspect();
        },
        resetZoomPan: () => {
            d3.select("#" + metric_id + " svg")
                .transition()
                .duration(500)
                .call(scatter_zoom.transform, d3.zoomIdentity);
        },
    };
}

export function plotCorrelation( metric_id, now_DV, data, aligned_polygons, aligned_polygon_order, if_inspect_mode, inspected_index, set_inspected_index ) {
    let zoom_k = 1;
    // Obtain the array of metric data
    let metric_data = aligned_polygons.map(polygon => polygon.metrics[metric_id]);
    let dv_data = unpack( data, now_DV );
    let sorted_data_by_DV = sortPolygonsByDepVarVal( aligned_polygons );

    // Generate and plot two axes
    let [if_log, unique_data, dv_range] = get_axis_range( data, now_DV );
    let x_scale = (if_log === "log10") ? d3.scaleLog().base(10).clamp(true).domain(dv_range).range([45, scatter_width+45]).nice()
        : d3.scaleLinear().domain(dv_range).range([45, scatter_width+45]).nice();
    let x_axis = (if_log === "log10") ? d3.axisBottom(x_scale).tickValues(unique_data).tickFormat(d3.format(".0e"))
        : d3.axisBottom(x_scale).ticks( Math.min(metric_data.length, 10) );
    let x_axis_group = d3.select('#'+metric_id+'-x-axis');
    x_axis_group
        .call(x_axis)
        .attr("transform", "translate(0, "+scatter_height+")");

    let y_scale = d3.scaleLinear()
        .domain([Math.min(Math.floor(Math.min(...metric_data)-0.0001), 0), Math.ceil(Math.max(...metric_data)+0.0001)])
        .range([scatter_height, 5])
        .nice();
    let y_axis = d3.axisLeft(y_scale).ticks(5);
    let y_axis_group = d3.select('#'+metric_id+'-y-axis');
    y_axis_group
        .call(y_axis)
        .attr("transform", "translate(45, 0)");

    // Plot axis titles
    let x_axis_title_selector = d3.select('#'+metric_id+'-x-title');
    let y_axis_title_selector = d3.select('#'+metric_id+'-y-title');
    x_axis_title_selector.text(now_DV).style('font-size', 11).style('text-anchor', 'middle');
    y_axis_title_selector.text(metric_id).style('font-size', 11).style("writing-mode", 'sideways-lr').style('text-anchor', 'middle');
    x_axis_title_selector.attr('transform', 'translate('+(scatter_width*0.5+30)+', '+(scatter_height+25)+')');
    y_axis_title_selector.attr('transform', 'translate(11.5'+','+(scatter_height*0.5)+')');

    d3.select('#'+metric_id+'-data')
        .selectAll('circle')
        .data(sorted_data_by_DV)
        .join('circle')
        .attr('cx', function(d){ return x_scale(dv_data[d]); })
        .attr('cy', function(d){ return y_scale(aligned_polygons[d].metrics[metric_id]); })
        .attr('r', 4 )
        .attr('stroke', function(d) { return aligned_polygons[d].id === inspected_index ? '#FFF' : 'none'; })
        .attr('stroke-width', 1.0 )
        .style('fill', function(d){ return aligned_polygons[d].color; });

    function updateView() {
        d3.select('#' + metric_id + '-data')
            .selectAll('circle')
            .attr('r', d => (aligned_polygons[d].id === inspected_index) ? (5 / zoom_k) : (4 / zoom_k))
            .attr('stroke', d => (aligned_polygons[d].id === inspected_index) ? '#FFF' : 'none')
            .attr('stroke-width', 1.0 / zoom_k )
            .attr('opacity', d => (inspected_index !== null) ? (aligned_polygons[d].id === inspected_index ? 1.0 : 0.4) : 1.0);

        // Move inspected point to front
        d3.select('#' + metric_id + '-data')
            .selectAll('circle')
            .each(function (d) {
                if (aligned_polygons[d].id === inspected_index) {
                    this.parentNode.appendChild(this);
                }
            });

        d3.select("#"+metric_id+"-trend-info #line-highlight")
            .style('stroke-width', 4.0 / zoom_k );

        d3.select("#"+metric_id+"-trend-info #line")
            .style('stroke-width', 2.0 / zoom_k );
    }

    function setInspect() {
        if (if_inspect_mode) {
            d3.select('#'+metric_id+'-data')
                .selectAll('circle')
                .on('mouseover', (e, d) => {
                    inspected_index = aligned_polygons[d].id;
                    set_inspected_index(aligned_polygons[d].id);
                })
                .on('mouseout', () => {
                    set_inspected_index(null);
                });
        } else {
            d3.select('#'+metric_id+'-data')
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
            d3.selectAll("."+metric_id+"-scatterplot")
                .attr('transform', e.transform);
            x_axis_group.call(x_axis.scale(e.transform.rescaleX(x_scale)));
            y_axis_group.call(y_axis.scale(e.transform.rescaleY(y_scale)));
            updateView();
        });
    d3.select("#"+metric_id+" svg").call(scatter_zoom);

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
            d3.select("#" + metric_id + " svg")
                .transition()
                .duration(500)
                .call(scatter_zoom.transform, d3.zoomIdentity);
        },
    };
}

export function formatMLREquation(model, curr_IVs, curr_DV, precision = 4) {
    const intercept = model.weights[0][0];
    const weights = model.weights.slice(-4);

    const indep_vars = curr_IVs;
    let equation = curr_DV + " = " + intercept.toFixed(precision);

    weights.forEach((weight, index) => {
        let featureName = indep_vars[index];
        let coefficient = parseFloat(weight);

        if (coefficient >= 0) {
            equation += ` + ${coefficient.toFixed(precision)} * ${featureName}`;
        } else {
            equation += ` - ${Math.abs(coefficient).toFixed(precision)} * ${featureName}`;
        }
    });
    return equation;
}

export function fitEquationForMetric( metric_id, curr_IVs, data, aligned_polygons ) {
    let indep_data = [];
    for (let i = 0; i < aligned_polygons.length; i++) {
        let curr_data = data[i];
        let curr_data_list = [0, 1, 2, 3].map(j => curr_data[curr_IVs[j]]);
        indep_data.push(curr_data_list);
    }

    let dep_data = [];
    for (let i = 0; i < aligned_polygons.length; i++) {
        let curr_polygon = aligned_polygons[i];
        dep_data.push([curr_polygon.metrics[metric_id]]);
    }

    let mlr = new MLR(indep_data, dep_data);
    return formatMLREquation(mlr, curr_IVs, metric_id);
}

export function efron_r2(y, pred_y){
    let n = y.length;
    let average_y = y.reduce((sum, val) => { return sum + val }, 0) / n;
    let SSR = y.reduce((sum, val, i) => {
        let diff = val - pred_y[i];
        return sum + diff * diff;
    }, 0);
    let SST = y.reduce((sum, val) => {
        let diff = val - average_y;
        return sum + diff * diff;
    }, 0);
    return 1.0 - (SSR / SST);
}

export function computeTrendForMetric( metric_id, aligned_polygons, aligned_polygon_order ) {
    let data = [];
    for (let i = 0; i < aligned_polygons.length; i++) {
        let curr_index = aligned_polygon_order[i];
        let curr_polygon = aligned_polygons[curr_index];
        data.push({x: i, y: curr_polygon.metrics[metric_id]});
    }
    let loess_result = loess(data);
    let y = data.map(p => p.y);
    let y_pred = loess_result.map(p => p[1]);

    return {points: loess_result, r2: efron_r2(y, y_pred)};
}

export function computeTrendForCorr( metric_id, aligned_polygons, aligned_polygon_order ) {
    let data = [];
    for (let i = 0; i < aligned_polygons.length; i++) {
        let curr_index = aligned_polygon_order[i];
        let curr_polygon = aligned_polygons[curr_index];
        data.push({x: curr_polygon.depVal, y: curr_polygon.metrics[metric_id]})
    }

    // preprocess to collapse duplicates by x
    let groups = {};
    data.forEach((d) => {
        if (!groups[d.x]) { groups[d.x] = []; }
        groups[d.x].push(d.y);
    });

    let collapsed_data = Object.keys(groups).map(k => ({
        x: Number(k),
        y: groups[k].reduce((a, b) => a + b, 0) / groups[k].length
    }));
    collapsed_data.sort((a, b) => a.x - b.x);

    let loess_result = loess(collapsed_data);
    let y = collapsed_data.map(p => p.y);
    let y_pred = loess_result.map(p => p[1]);

    return {points: loess_result, r2: efron_r2(y, y_pred)};
}

export function generatePathFromQuadReg( id, points, x_scale, y_scale ) {
    let path_points = [];
    for (let i = 0; i < points.length; i++) {
        path_points.push([x_scale(points[i][0]), y_scale(points[i][1])]);
    }
    let line = d3.line().curve(d3.curveBasis);
    let path = line(path_points);

    d3.select("#"+id+"-trend-info #line-highlight")
        .attr("d", path)
        .style("fill", "none")
        .style("opacity", 0.7)
        .style("stroke", "#fff");

    d3.select("#"+id+"-trend-info #line")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "#000");
}