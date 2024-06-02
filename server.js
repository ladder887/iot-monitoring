const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const { Worker } = require('worker_threads');

const app = express();
const port = 9999;

let dataList = { packetData: [], deviceData: [] };
const scanInterval = 30000;
const dataBroadcastInterval = 2000;

app.use(express.json());

async function scanNetwork(range) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./scanner.js');
        worker.on('message', (message) => {
            if (message.type === 'scanResults') {
                resolve(message.scanResults);
            } else if (message.error) {
                reject(new Error(message.error));
            }
        });
        worker.on('error', (error) => {
            reject(new Error(`Worker error: ${error.message}`));
        });
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
        worker.postMessage(range);
    });
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws, req) {
    if (req.url === '/data') {
        handleDataWsConnection(ws);
    } else if (req.url === '/ws') {
        handleCommandWsConnection(ws);
    }
});

function handleDataWsConnection(ws) {
    console.log('A client connected via WebSocket for /data');
    ws.on('message', function incoming(message) {
        try {
            const data = JSON.parse(message);
            if (Array.isArray(data) && data.length > 0) {
                dataList.packetData.push(...data);
                console.log('Received packet data:', data);
            }
        } catch (error) {
            console.error('Error parsing received data:', error);
        }
    });
}

function handleCommandWsConnection(ws) {
    console.log('A client connected via WebSocket for /ws');
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
}

async function performNetworkScanAndBroadcast() {
    try {
        const range = '192.168.3.*';
        const scanResults = await scanNetwork(range);
        if (scanResults.length > 0) {
            dataList.deviceData = scanResults;
            console.log('Scan results:', scanResults);
            console.log('Updated dataList:', dataList);
        }
    } catch (error) {
        console.error('Error during network scan:', error);
    }
}

setInterval(performNetworkScanAndBroadcast, scanInterval);

setInterval(() => {
    if (dataList.packetData.length > 0 || dataList.deviceData.length > 0) {
        const dataToSend = JSON.stringify(dataList);
        wss.clients.forEach(function each(client) {
            if (client.readyState === 1) {
                client.send(dataToSend);
            }
        });
        dataList.packetData = [];
    }
}, dataBroadcastInterval);

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`WebSocket server listening at ws://localhost:${port}/ws`);
    console.log(`WebSocket server listening at ws://localhost:${port}/data`);
});
