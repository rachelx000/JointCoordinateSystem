// Reference: https://plotly.com/javascript/parallel-coordinates-plot/
import { logarithmic_growth_check } from "./JCS.js";
import Plotly from 'plotly.js-dist';

export function drawPCP( data, curr_IVs, curr_DV, color_scheme ) {

    function unpack(varname) {
        return data.map(entry => entry[varname]);
    }

    function generate_colorscale( color_scheme ) {
        let interval = 1.0 / (color_scheme.length - 1);
        let colorscale_list = [];
        for (let i = 0; i < color_scheme.length; i++) {
            colorscale_list.push([Math.min(i*interval, 1.0), color_scheme[i]]);
        }
        return colorscale_list;
    }

    function get_range( curr_data ) {
        return [Math.min(...curr_data), Math.max(...curr_data)];
    }

    let pcp_data = [
        {
            type: 'parcoords',
            pad: [80,80,80,80],
            line: {
                showscale: true,
                color: unpack(curr_DV),
                colorscale: generate_colorscale(color_scheme)
            },
            dimensions: [0, 1, 2, 3].map(index => {
                    let if_log = logarithmic_growth_check(data, curr_IVs[index])[0];
                    let curr_values = if_log ? unpack(curr_IVs[index]).map(d => d === 0 ? 0 : Math.log10(d))
                        : unpack(curr_IVs[index]);
                    return {
                        range: get_range(curr_values),
                        label: curr_IVs[index],
                        values: curr_values
                    }
                })
        },
    ];

    console.log(pcp_data);

    Plotly.newPlot('pcp-container', pcp_data);
}