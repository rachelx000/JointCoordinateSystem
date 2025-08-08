// Reference: https://plotly.com/javascript/parallel-coordinates-plot/
import { get_axis_range, unpack } from "./JCS.js";
import Plotly from 'plotly.js-dist';
import * as d3 from 'd3';

export function drawPCP( data, curr_IVs, curr_DV, color_scheme ) {

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


