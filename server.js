const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const port = 9999;

app.use(express.json());

app.post('/data', (req, res) => {
  console.log('Received data:', req.body);
  wss.clients.forEach(function each(client) {
    if (client.readyState === 1) {
      client.send(JSON.stringify(req.body));
    }
  });
  res.send('Data received');
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on('connection', function connection(ws) {
  console.log('A client connected via WebSocket');
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`WebSocket server listening at ws://localhost:${port}/ws`);
});
