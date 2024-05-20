import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import GraphComponent from './components/GraphComponent';
import GraphData from './components/GraphData';
import { scannerparser, packetparser } from './components/dataProcessing';

function App() {
  
  const svgRef = useRef(null);
  const infoSvgRef = useRef(null);
  const gRef = useRef(null);
  const linkRef = useRef(null);
  const nodeRef = useRef(null);
  const [data, setData] = useState(null);
  const ws = useRef(null);
  const tempData = useRef([]); // WebSocket으로부터 받은 데이터를 임시 저장하는 배열
  
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
                console.log(newData.scanResults);
            } else {
                tempData.current = tempData.current.concat(newData);
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

    const interval = setInterval(async () => {
      if (tempData.current.length > 0) {
        try {
          const processedData = await packetparser(tempData.current); // 임시 배열의 데이터를 처리
          setData(processedData); // 상태 업데이트
          tempData.current = []; // 임시 배열 초기화
        } catch (error) {
          console.error("Error processing data:", error);
        }
      }
    }, 2000); // 1초마다 실행

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 정리
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
