import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { drag, handleNodeClick} from './Event';

const GraphData = ({ svgRef, infoSvgRef, linkRef, nodeRef, data, deviceData}) => {
    const width = 800, height = 800;
    const color = d3.scaleOrdinal()
        .domain(["Router", "Device", "Port"])
        .range(["red", "green", "orange"]);

    const size = d3.scaleOrdinal()  
        .domain(["Router", "Device", "Port"])
        .range([20, 15, 5]);

    const linkColor = d3.scaleOrdinal()
        .domain(["TCP", "UDP", "ICMP", "Other", "Port"])
        .range(["green", "red", "blue", "black", "gray"]);

    const simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody())
        .force("collide", d3.forceCollide().radius(2))
        .force("link", d3.forceLink().id(d => d.id).distance(d => {
            //간선의 길이
            if (d.type === "Port") {
              return 7;
            } else {
              return 200; 
            }
          })
          .strength(d => {
            //간선의 장력
            if (d.type === "Port") {
                return 0.9;
            } else {
                return 0.1;
            }
        }))
        .force("center", d3.forceCenter(width / 32, height / 32));
        //.force("x", d3.forceX())
        //.force("y", d3.forceY())


    useEffect(() => {

        const svg = d3.select(svgRef.current);
        const infoSvg = d3.select(infoSvgRef.current);

        let old = new Map(nodeRef.current?.selectAll("circle").data()?.map(d => [d.id, d]) || []);
        data.nodes = data.nodes.map(d => {
            let oldNode = old.get(d.id);
            return {...oldNode, ...d};
        });
    
        data.nodes.forEach(node => {
            if(node.type === "Port" && !old.has(node.id)) {
                let connectedDeviceNode = data.links.find(link => link.target === node.id || link.source === node.id);
                if(connectedDeviceNode) {
                    let deviceNodeId = connectedDeviceNode.target === node.id ? connectedDeviceNode.source : connectedDeviceNode.target;
                    let deviceNode = data.nodes.find(n => n.id === deviceNodeId);
                    if(deviceNode) {
                        node.x = deviceNode.x;
                        node.y = deviceNode.y;
                    }
                }
            }
        });
        data.links = data.links.map(d => ({...d}));
        

        const node = nodeRef.current
            .selectAll("circle")
            .data(data.nodes, d => d.id)
            .join(
                enter => enter.append("circle")
                    .attr("r", d => size(d.type))
                    .attr("fill", d => color(d.type))
                    .call(drag(simulation))
                    .on("click", (event, d) => handleNodeClick(event, d, infoSvg))
            );
    
        node.append("title").text(d => d.id);
    
        const link = linkRef.current
            .selectAll("line")
            .data(data.links, d => [d.source, d.target])
            .join("line")
            .attr("stroke", d => linkColor(d.type))
            .attr("stroke-width", d => Math.sqrt(d.value));

        simulation.nodes(data.nodes)
            .on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });
        simulation.force("link").links(data.links);
    }, [data, deviceData]);

};
export default GraphData;
