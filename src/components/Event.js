import * as d3 from 'd3';
import { nodeInformation } from './dataProcessing';

export function handleNodeClick(event, d, infoSvg) {
    const infoWidth = 500, infoHeight = 800;
    d3.selectAll("circle").style("stroke", "#fff");
    d3.select(event.currentTarget).style("stroke", "blue");
    
    nodeInformation(d).then((info) => {
        infoSvg.selectAll("foreignObject").remove();
    
        const textbox = infoSvg.append("foreignObject")
            .attr("id", "infobox")
            .attr("x", 0)
            .attr("y", 80)
            .attr("width", infoWidth - 20)
            .attr("height", infoHeight - 70);

        const div = textbox.append("xhtml:div")
            .style("width", "100%")
            .style("height", "100%")
            .style("overflow", "auto");

        Object.entries(info).forEach(([key, value]) => {
            if (key.includes("GRFANA")) {
                div.append("xhtml:a")
                    .attr("href", value)
                    .attr("target", "_blank")
                    .style("display", "block")
                    .style("margin", "0px")
                    .style("margin-bottom", "10px")
                    .style("padding", "7px")
                    .style("border-bottom", "1px solid #ccc")
                    .append("xhtml:img")
                    .attr("src", "grfana.png")
                    .attr("alt", "Link Image")
                    .style("width", "8%")
                    .style("height", "auto");
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