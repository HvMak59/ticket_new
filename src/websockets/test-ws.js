const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('open', () => {
    console.log('CONNECTED');
    ws.send(JSON.stringify({
        virtualDeviceIds: ['VD_001'],
        metricsAttributeId: 'TEMP',
    }));
});

ws.on('message', (msg) => {
    console.log('RECEIVED:', msg.toString());
});

ws.on('error', console.error);
