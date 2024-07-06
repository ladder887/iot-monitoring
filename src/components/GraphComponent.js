import React, { useEffect } from 'react';
import * as d3 from 'd3';
import ZoomComponent from './ZoomComponent';

const GraphComponent = ({ svgRef, infoSvgRef, gRef, linkRef, nodeRef }) => {
    const width = 1000, height = 600;
    const infoWidth = 400, infoHeight = 600;

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr("id", "svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        const infoSvg = d3.select(infoSvgRef.current)
            .attr("id", "infoSvg")
            .attr("width", infoWidth)
            .attr("height", infoHeight)
            .attr("viewBox", [0, 0, infoWidth, infoHeight])
            .attr("style", "max-width: 100%; height: auto;")
            .attr("x", width)
            .attr("y", 0);

        gRef.current = svg.append("g");

        linkRef.current = gRef.current.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 1);

        nodeRef.current = gRef.current.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);
        
        infoSvg.append("text")
            .attr("x", 125)
            .attr("y", 30)
            .text("information")
            .attr("font-size", "30px")
            .attr("fill", "green");

        svg.append("text")
            .attr("x", (-width / 2) + 10)
            .attr("y", (-height / 2) + 20)
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "black");

            
        svg.append('defs');

    }, [])

    return (
        <div class="flex-container">
        <div class = "showcase">
            <svg ref={svgRef}></svg>
            <ZoomComponent gRef={gRef} svgRef = {svgRef} />
        </div>
        <div class = "info">
            <svg ref={infoSvgRef}></svg>
        </div>
        </div>
    );
};
export default GraphComponent;
