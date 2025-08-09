import * as d3 from "d3";

const scatter_width = 280, scatter_height = 110;

export function plotShapeMetric( metric_id, aligned_polygons, aligned_polygon_order, if_inspect_mode, inspected_index, set_inspected_index, aligned_origin_data ) {
    let zoom_k = 1;
    // Obtain the array of metric data
    let metric_data = aligned_polygons.map(polygon => polygon.metrics[metric_id]);

    // Generate and plot two axes
    let x_scale = d3.scaleLinear()
        .domain([0, metric_data.length])
        .range([40, scatter_width+40])
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
        .attr("transform", "translate(40, 0)");

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