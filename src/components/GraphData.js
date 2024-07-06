import { useEffect } from 'react';
import * as d3 from 'd3';
import { drag, handleNodeClick } from './Event';

const GraphData = ({ svgRef, infoSvgRef, linkRef, nodeRef, data }) => {
    const width = 1000, height = 600;

    const nodeImageMap = d3.scaleOrdinal()
        .domain(["router", "server", "benign_device", "non_detection", "attack_device", "reflect_device", "victim_device", "unauthorized_device", "port"])
        .range(["router.gif", "server.gif", "benign_device.gif", "non_detection.gif", "attack_device.gif", "reflect_device.gif", "victim_device.gif", "unauthorized_device.gif", "port.gif"]);

    const nodeSize = d3.scaleOrdinal()
        .domain(["router", "server", "benign_device", "attack_device", "reflect_device", "victim_device", "un_device", "port"])
        .range([30, 30, 30, 30, 30, 30, 30, 7]);

    const linkColor = d3.scaleOrdinal()
        .domain(["TCP", "UDP", "ICMP", "other", "port"])
        .range(["green", "blue", "red", "black", "white"]);


    const simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(0.1))
        .force("collide", d3.forceCollide().radius(10))
        .force("link", d3.forceLink().id(d => d.id).distance(d => {
            if (d.type === "port") {
                return 30;
            } else {
                return 200;
            }
        })
        .strength(d => {
            if (d.type === "port") {
                return 1;
            } else {
                return 0.01;
            }
        }))
        .force("center", d3.forceCenter(width / 2, height / 2));
        //.force("x", d3.forceX())
        //.force("y", d3.forceY());

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const infoSvg = d3.select(infoSvgRef.current);

        const circleRadius = Math.min(width, height);
        const center = { x: width / 2, y: height / 2 };

        let oldNodesMap = new Map(nodeRef.current?.selectAll("circle").data()?.map(d => [d.id, d]) || []);
        
        data.nodes = data.nodes.map((d, index, { length }) => {
            let oldNode = oldNodesMap.get(d.id);
            if (oldNode) {
                return { ...d, x: oldNode.x, y: oldNode.y };
            } else {
                const angle = (index / length) * 2 * Math.PI; 
                return { ...d, x: center.x + circleRadius * Math.cos(angle) / 2, y: center.y + circleRadius * Math.sin(angle) / 2 };
            }
        });

        data.nodes.forEach(node => {
            if (node.type === "port" && !oldNodesMap.has(node.id)) {
                let connectedDeviceNode = data.links.find(link => link.target === node.id || link.source === node.id);
                if (connectedDeviceNode) {
                    let deviceNodeId = connectedDeviceNode.target === node.id ? connectedDeviceNode.source : connectedDeviceNode.target;
                    let deviceNode = data.nodes.find(n => n.id === deviceNodeId);
                    if (deviceNode) {
                        const portIndex = data.nodes.filter(n => n.type === 'port').indexOf(node);
                        const angle = (portIndex / data.nodes.length) * 2 * Math.PI;
                        node.x = deviceNode.x + 30 * Math.cos(angle);
                        node.y = deviceNode.y + 30 * Math.sin(angle);
                    }
                }
            }
        });
        //data.links = data.links.map(d => ({ ...d }));
        
        const defs = svg.select('defs');
        defs.selectAll('*').remove();

        // 노드 패턴 정의
        data.nodes.forEach(d => {
            defs.append('pattern')
                .attr('id', `pattern-${d.id}`)
                .attr('patternUnits', 'objectBoundingBox')
                .attr('width', 1)
                .attr('height', 1)
                .append('image')
                .attr('xlink:href', nodeImageMap(d.type))
                .attr('width', nodeSize(d.type) * 2)
                .attr('height', nodeSize(d.type) * 2)
                .attr('x', 0)
                .attr('y', 0);
        });

        defs.append('marker')
            .attr('id', 'rectangle-marker')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 5)
            .attr('refY', 5)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto-start-reverse')
            .append('rect')
            .attr('x', 1)
            .attr('y', 1)
            .attr('width', 8)
            .attr('height', 8)
            .attr('fill', '#999');

        const node = nodeRef.current
            .selectAll("circle")
            .data(data.nodes, d => d.id)
            .join(
                enter => enter.append("circle")
                    .attr("r", d => nodeSize(d.type))
                    .attr("fill", d => `url(#pattern-${d.id})`)
                    .call(drag(simulation))
                    .on("click", (event, d) => handleNodeClick(event, d, infoSvg)),
                update => update
                    .attr("r", d => nodeSize(d.type))
                    .attr("fill", d => `url(#pattern-${d.id})`)
            );

        const link = linkRef.current
            .selectAll("line")
            .data(data.links.filter(d => d.type !== "port"), d => [d.source, d.target])
            .join("line")
            .attr("stroke", d => linkColor(d.type))
            .attr("stroke-width", d => Math.sqrt(d.value))
            .attr("marker-end", "url(#rectangle-marker)");


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
        simulation.alpha(1).restart();

    }, [svgRef, infoSvgRef, linkRef, nodeRef, data, linkColor, nodeImageMap, nodeSize, simulation]);

    return null;
};

export default GraphData;
