import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { drag, handleNodeClick} from './Event';
import ZoomComponent from './ZoomComponent';

const GraphComponent = ({ svgRef, infoSvgRef, gRef, linkRef, nodeRef }) => {
    const width = 800, height = 800;
    const infoWidth = 400, infoHeight = 800;


    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr("id", "svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto; border:2px solid black;");

        const infoSvg = d3.select(infoSvgRef.current)
            .attr("id", "infoSvg")
            .attr("width", infoWidth)
            .attr("height", infoHeight)
            .attr("viewBox", [0, 0, infoWidth, infoHeight])
            .attr("style", "max-width: 100%; height: auto; border:2px solid black;")
            .attr("x", width)
            .attr("y", 0);

        gRef.current = svg.append("g");

        linkRef.current = gRef.current.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 1);

        nodeRef.current = gRef.current.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);
            
        svg.append("text")
            .attr("x", (-width / 2) + 10)
            .attr("y", (-height / 2) + 20)
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "black");

    }, [])

    return (
        <div style={{ overflowX: 'auto' }}>
            <svg ref={svgRef}></svg>
            <svg ref={infoSvgRef}></svg>
            <ZoomComponent gRef={gRef} svgRef = {svgRef} />
        </div>
    );
};
export default GraphComponent;
