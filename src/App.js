import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import GraphComponent from './components/GraphComponent';
import GraphData from './components/GraphData';
import { scannerparser, packetparser } from './components/dataProcessing';
import { pack } from 'd3';

function App() {
    const svgRef = useRef(null);
    const infoSvgRef = useRef(null);
    const gRef = useRef(null);
    const linkRef = useRef(null);
    const nodeRef = useRef(null);
    const [deviceData, setDeviceData] = useState(null);
    const [data, setNetData] = useState(null);
    const ws = useRef(null);
  
    let nodes = []; // 노드 목록 초기화
    let links = []; // 링크 목록 초기화
    let nodeIds = new Set(); // 노드 ID 저장을 위한 Set
    let linkIds = new Set(); // 링크 ID (source-target 쌍) 저장을 위한 Set

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:9999/ws');

        ws.current.onmessage = async (event) => {
            try {
                const newData = JSON.parse(event.data);
                if (newData.type && newData.type === 'scan') {
                    const processedData = await scannerparser(newData.scanResults, nodes, links, nodeIds, linkIds);
                    setDeviceData(processedData)
                    console.log(newData.scanResults);
                } else {
                    const processedData = await packetparser(newData)
                    setNetData(processedData)
                }
            } catch (error) {
                console.error("Error parsing data:", error);
            }
        };

        ws.current.onclose = () => {
            console.log("WebSocket connection closed");
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    return (
        <div id="chart">
            <GraphComponent svgRef={svgRef} infoSvgRef={infoSvgRef} gRef={gRef} linkRef={linkRef} nodeRef={nodeRef} />
            {data && <GraphData svgRef={svgRef} infoSvgRef={infoSvgRef} linkRef={linkRef} nodeRef={nodeRef} data={data} />}
        </div>
    );
}

export default App;
