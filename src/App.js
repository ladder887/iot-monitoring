import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import GraphComponent from './components/GraphComponent';
import GraphData from './components/GraphData';
import { scannerparser, dataParser } from './components/dataProcessing';

function App() {
    const svgRef = useRef(null);
    const infoSvgRef = useRef(null);
    const gRef = useRef(null);
    const linkRef = useRef(null);
    const nodeRef = useRef(null);
    const [data, setData] = useState(null);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:9999/ws');
        ws.current.onmessage = async (event) => {
            try {
                const newData = JSON.parse(event.data);
                console.log(newData);
                const processedData = await dataParser(newData)
                setData(processedData)
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
