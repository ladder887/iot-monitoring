import * as d3 from 'd3';
import { nodeInformation } from './dataProcessing';

export function handleNodeClick(event, d, infoSvg) {
    const infoWidth = 600, infoHeight = 800;
    d3.selectAll("circle").style("stroke", "#fff");
    d3.select(event.currentTarget).style("stroke", "blue");
    
    nodeInformation(d).then((info) => {
        infoSvg.selectAll("*").remove();
    
        infoSvg.append("text")
            .attr("x", 90)
            .attr("y", 30)
            .text("Node information")
            .attr("font-family", "sans-serif")
            .attr("font-size", "30px")
            .attr("fill", "red");
    
        const textbox = infoSvg.append("foreignObject")
            .attr("x", 10)
            .attr("y", 60)
            .attr("width", infoWidth - 20)
            .attr("height", infoHeight - 70);

        const div = textbox.append("xhtml:div")
            .style("width", "100%")
            .style("height", "100%")
            .style("overflow", "auto");

        Object.entries(info).forEach(([key, value]) => {
            if (key.includes("URL")) {
                if (Array.isArray(value)) {
                    div.append("xhtml:p")
                        .style("margin", "0px")
                        .style("padding", "5px")
                        .style("font-size", "15px")
                        .style("font-weight", "bold")
                        .text(key)
                    value.forEach((value) => {
                        div.append("xhtml:a")
                            .attr("href", value)
                            .attr("target", "_blank")
                            .style("display", "block")
                            .style("margin", "0px")
                            .style("padding", "7px")
                            .text(value);
                    });
                    div.append("xhtml:p")
                        .style("margin", "0px")
                        .style("margin-bottom", "10px")
                        .style("padding", "5px")
                        .style("border-bottom", "1px solid #ccc");
                } else {
                    div.append("xhtml:p")
                        .style("margin", "0px")
                        .style("padding", "5px")
                        .style("font-size", "15px")
                        .style("font-weight", "bold")
                        .text(key)
                    div.append("xhtml:a")
                        .attr("href", value)
                        .attr("target", "_blank")
                        .style("display", "block")
                        .style("margin", "0px")
                        .style("margin-bottom", "10px")
                        .style("padding", "7px")
                        .style("border-bottom", "1px solid #ccc")
                        .text(value);
                }
                
            }else {
                div.append("xhtml:p")
                    .style("margin", "0")
                    .style("padding", "5px")
                    .style("font-size", "15px")
                    .style("font-weight", "bold")
                    .text(key);
                div.append("xhtml:p")
                    .style("margin", "0")
                    .style("margin-bottom", "10px")
                    .style("padding", "7px")
                    .style("border-bottom", "1px solid #ccc")
                    .text(value);
            }
        });
    }).catch((error) => {
        console.error("에러:", error);
    });
}

export function drag(simulation) {
    const dragstarted = (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    };

    const dragged = (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
    };

    const dragended = (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    };

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}