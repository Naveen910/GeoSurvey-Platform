const WebSocket = require('ws');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      console.log('Received:', parsed);

      // Echo/broadcast the update
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ event: 'fms-update', payload: parsed }));
        }
      });
    });

    ws.send(JSON.stringify({ event: 'connection', message: 'Connected to FMS socket server' }));
  });
}

module.exports = setupWebSocket;
