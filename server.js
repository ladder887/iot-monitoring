const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const { Worker } = require('worker_threads'); // Worker 모듈 추가

const app = express();
const port = 9999;

let dataList = [];

// Express 서버 설정
app.use(express.json());

// 네트워크 스캔을 위한 함수
async function scanNetwork(range) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./scanner.js');
        worker.on('message', (message) => {
            if (message.type === 'scanResults') {
                resolve(message.scanResults);
            } else if (message.error) {
                reject(message.error);
            }
        });
        worker.postMessage(range);
    });
}

// 클라이언트로부터 스캔 요청을 받는 엔드포인트 추가
app.post('/scan', async (req, res) => {
    const { range } = req.body;
    try {
        const scanResults = await scanNetwork(range);
        res.json({ scanResults });
    } catch (error) {
        console.error('Error during network scan:', error);
        res.status(500).json({ error: 'An error occurred during network scan' });
    }
});

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 서버 생성 및 실행
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on('connection', function connection(ws) {
    console.log('A client connected via WebSocket');
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
});

// 5초마다 네트워크 스캔 실행
setInterval(async () => {
    try {
        const range = '192.168.22.*'; // 스캔할 범위
        const scanResults = await scanNetwork(range);
        dataList.push(scanResults); // 스캔 결과를 데이터 리스트에 추가
        console.log(scanResults)
    } catch (error) {
        console.error('Error during network scan:', error);
    }
}, 20000); // 10초마다 실행

//2초마다 WebSocket 클라이언트로 데이터 전송
setInterval(() => {
    if (dataList.length > 0) {
        const dataToSend = JSON.stringify(dataList);
        wss.clients.forEach(function each(client) {
            if (client.readyState === 1) {
                client.send(dataToSend);
            }
        });
        dataList = [];  //데이터 리스트를 비움
    }
}, 2000);   //2초마다 실행

// Express 서버와 WebSocket 서버를 같은 HTTP 서버에서 실행
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`WebSocket server listening at ws://localhost:${port}/ws`);
});
