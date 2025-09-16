import { sortPolygonsByDepVarVal } from "./Comparison.js";
import { point_list_to_path_str, path_str_to_point_list } from "./JCS.js";
import * as d3 from 'd3';

const canvas_width = 550, canvas_height = 550;
const max_width = 530, max_height = 530;
let marginX = (canvas_width - max_width) / 2;
let marginY = (canvas_height - max_height) / 2;

function get_bounding_box( point_list ) {
    let xlist = point_list.map(p => p[0]);
    let ylist = point_list.map(p => p[1]);

    return {
        minX: Math.min(...xlist), maxX: Math.max(...xlist),
        minY: Math.min(...ylist), maxY: Math.max(...ylist),
        width: Math.max(...xlist) - Math.min(...xlist),
        height: Math.max(...ylist) - Math.min(...ylist)
    };
}

function get_centroid( point_list ) {
    return {
        x: point_list.reduce((total, p) => total + p[0]*1.0, 0) / point_list.length,
        y: point_list.reduce((total, p) => total + p[1]*1.0, 0) / point_list.length
    }
}

function get_decimal_places( num ) {
    if (!isFinite(num) || Number.isInteger(num)) {
        return 0;
    }

    let num_str = num.toString();
    console.log(num, num_str);
    if (num_str.includes('e') || num_str.includes('E')) {
        return (+(num_str)).toString().split('.')[1]?.length || 0;
    } else {
        return num_str.includes('.') ? num_str.split('.')[1].length : 0;
    }

}

function align_polygons_by_centroid(polyA, polyB) {
    const centroidA = get_centroid(polyA);
    const centroidB = get_centroid(polyB);

    const dx = centroidA.x - centroidB.x;
    const dy = centroidA.y - centroidB.y;

    let aligned_polyB = polyB.map(point => [
        point[0] * 1.0 + dx,
        point[1] * 1.0 + dy
    ]);

    return aligned_polyB;
}

function scale_points( point_list, scale, centerX, centerY ) {
    return point_list.map(p => [ centerX + (p[0] - centerX) * scale,
        centerY + (p[1] - centerY) * scale]);
}


function fit_first_polygon( polygon ) {
    // Scale the outermost polygon to maximize its area within the boundary of the canvas
    let point_list = path_str_to_point_list( polygon.points );
    let polygon_bbox = get_bounding_box( point_list );

    let scaleX = max_width / polygon_bbox.width;
    let scaleY = max_height / polygon_bbox.height;
    let scale = Math.min(scaleX, scaleY);

    // offsets to center the polygon on the canvas
    let offsetX = (max_width  - polygon_bbox.width  * scale) / 2 - polygon_bbox.minX * scale;
    let offsetY = (max_height - polygon_bbox.height * scale) / 2 - polygon_bbox.minY * scale;

    let scaled_point_list = point_list.map(p => [p[0] * scale + offsetX + marginX, p[1] * scale + offsetY + marginY]);
    return [{ points: point_list_to_path_str(scaled_point_list), color: polygon.color }, scale];
}

function is_point_in_convex_poly( point, poly_point_list, epsilon=1e-9 ) {
    // Since the polygon is always convex, all interior angles are less than 180
    // It ensures that a point inside the poly will always have the same turn direction
    // with respect to each edge
    // Source: https://stackoverflow.com/questions/15490795/determine-if-a-2d-point-is-within-a-quadrilateral#:~:text=If%20these%20quantities%20all%20have%20the%20same,side%20(left%20or%20right)%20of%20every%20edge.)

    let sign = null;

    // Iteration to check the sign of the cross product of (edge × pointVector) for all edges
    for (let i = 0; i < poly_point_list.length; i++) {
        let j = (i + 1) % poly_point_list.length;
        let curr_edge = {
            x: poly_point_list[j][0] - poly_point_list[i][0],
            y: poly_point_list[j][1] - poly_point_list[i][1]
        };
        let vec_to_p = {
            x: point[0] - poly_point_list[i][0],
            y: point[1] - poly_point_list[i][1],
        }
        let cross_prod = curr_edge.x * vec_to_p.y - curr_edge.y * vec_to_p.x;

        if (Math.abs(cross_prod) < epsilon) continue;

        let curr_sign = cross_prod > 0;
        if (sign === null) {
            sign = curr_sign;
        } else if (sign !== curr_sign) {
            return false;
        }
    }

    return true;
}

function compute_min_dist_to_poly_edge( point, poly_point_list ) {
    let min_dist = Infinity;
    for (let i = 0; i < poly_point_list.length; i++) {
        let j = (i + 1) % poly_point_list.length;
        let dist = compute_point_to_seg_dist(point, poly_point_list[i], poly_point_list[j]);
        min_dist = Math.min(min_dist, dist);
    }
    return min_dist;
}

function compute_point_to_seg_dist(point, seg_start, seg_end) {
    // compute the vector for the segment
    let dx = seg_end[0] - seg_start[0];
    let dy = seg_end[1] - seg_start[1];
    let squared_len = dx * dx + dy * dy;

    // if the segment is just a single point
    if (squared_len === 0) {
        const pdx = point[0] - seg_start[0];
        const pdy = point[1] - seg_start[1];
        return Math.sqrt(pdx * pdx + pdy * pdy);
    }

    // compute scalar projection of vector (p - seg_start) onto the segment vector
    const t = Math.max(0, Math.min(1,
        ((point[0] - seg_start[0]) * dx + (point[1] - seg_start[1]) * dy) / squared_len));
    const projX = seg_start[0] * 1.0 + t * dx;
    const projY = seg_start[1] * 1.0 + t * dy;
    const pdx = point[0] - projX;
    const pdy = point[1] - projY;

    return Math.sqrt(pdx * pdx + pdy * pdy);
}

function compute_optimal_scale_for_nesting( inner_point_list, outer_point_list, outer_center, input_max_scale,
                                            tightness, safety_buffer_pixels, max_iterations ) {
    // Set the parameters for binary search
    let max_scale = input_max_scale;
    let precision_tolerance = "1e-"+(get_decimal_places(max_scale)+1);
    let min_scale = 0.0;
    let iterations = 0;
    let best_valid_scale = 0;
    let last_valid_dist = 0;
    while (max_scale - min_scale > precision_tolerance && iterations < max_iterations) {
        let if_valid = true;
        let min_dist = Infinity;

        let test_scale = (max_scale + min_scale) / 2;
        let scaled_quad_point_list = scale_points(inner_point_list, test_scale, outer_center.x, outer_center.y);
        // test all points to check if crossing is formed
        for (let i = 0; i < scaled_quad_point_list.length; i++) {
            let curr_p = scaled_quad_point_list[i];
            if (!is_point_in_convex_poly(curr_p, outer_point_list, precision_tolerance)) {
                if_valid = false;
                break;
            }
            let dist = compute_min_dist_to_poly_edge(curr_p, outer_point_list)
            min_dist = Math.min(min_dist, dist);
        }

        // Validation
        if (if_valid && min_dist >= safety_buffer_pixels) {
            min_scale = test_scale;
            best_valid_scale = test_scale;
            last_valid_dist = min_dist;
        } else {
            max_scale = test_scale;
        }

        iterations++;
    }

    const finalScale = best_valid_scale * tightness;
    return {
        scale: finalScale,
        iterations: iterations,
        finalDistance: last_valid_dist,
    };
}

export function nestingPolygons( polygons, params ) {
    let sorted_indices = sortPolygonsByDepVarVal(polygons);
    let nested_polygons = [];
    let stats = {
        totalIterations: 0,
        avgEfficiency: 0,
        minDistance: Infinity,
        scaleFactors: [],
        processingTime: 0
    }

    let start_time = performance.now();

    // Step 1: Make first polygon maximize its area within the canvas
    let first_polygon = polygons[sorted_indices[0]];
    let [scaled_first_polygon, first_scale] = fit_first_polygon(first_polygon);
    nested_polygons.push(scaled_first_polygon);
    stats.scaleFactors.push(first_scale);

    // Step 2: Process every subsequent polygon
    for (let i = 1; i < sorted_indices.length; i++) {
        let curr_poly = polygons[sorted_indices[i]];
        let outer_poly = nested_polygons[i - 1];
        let max_scale = stats.scaleFactors[i - 1];

        let outer_point_list = path_str_to_point_list(outer_poly.points);
        let curr_point_list = path_str_to_point_list(curr_poly.points);

        // let outer_center = get_center(outer_point_list);
        let outer_center = get_centroid(outer_point_list);
        // align the inner polygon's centroid with the outer polygon's
        curr_point_list = align_polygons_by_centroid(outer_point_list, curr_point_list);

        let scaling_result = compute_optimal_scale_for_nesting(
            curr_point_list, outer_point_list, outer_center, max_scale, params.tightness, params.safetyBufferPixels, params.maxIterations);
        let scaled_quad_point_list = scale_points(
            curr_point_list, scaling_result.scale, outer_center.x, outer_center.y
        );

        nested_polygons.push({
            points: point_list_to_path_str(scaled_quad_point_list),
            color: curr_poly.color
        });

        // Compute stats
        stats.totalIterations += scaling_result.iterations;
        stats.minDistance = Math.min(stats.minDistance, scaling_result.finalDistance);
        stats.scaleFactors.push(scaling_result.scale);
    }

    stats.processingTime = performance.now() - start_time;

    return [nested_polygons, stats];
}

export function plotNestedPolygons( nested_polygons, if_color_block_mode ) {
    d3.select('#dynamic-jcs-canvas')
        .selectAll('polygon')
        .data(nested_polygons)
        .join('polygon')
        .attr('points', function(d) { return d.points } )
        .attr('fill-opacity', 0.2)
        .classed('highlight-stroke', false);

    function updateView(){
        d3.select('#dynamic-jcs-canvas')
            .selectAll('polygon')
            .attr('fill', function(d) { return if_color_block_mode ? d.color : 'none' })
            .attr('stroke', function(d) { return if_color_block_mode ? '#FFF' : d.color })
            .attr('stroke-width', if_color_block_mode ? 0.0 : 1.5);
    }
    updateView();

    return {
        updateColorBlockMode: (now_if_color_block) => {
            if_color_block_mode = now_if_color_block;
            console.log(if_color_block_mode)
            updateView();
        }
    };
}