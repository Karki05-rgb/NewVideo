// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ port: 3000 });

// wss.on('connection', function connection(ws) {
//   console.log('Client connected');

//   ws.on('message', function incoming(message) {
//     console.log('Received:', message);
//     ws.send(`Server received: ${message}`);
//   });

//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
// });

// console.log('WebSocket server started on ws://localhost:3000');


const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ port: 3000 });
let counter = 0;

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    // `message` is a base64 string of the image
    const base64Data = message.replace(/^data:image\/jpeg;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save the image to the local server directory
    const filename = `webcam_${Date.now()}_${counter++}.jpg`;
    const filePath = path.join(__dirname, 'images', filename);

    // Make sure 'images' folder exists
    fs.mkdirSync(path.join(__dirname, 'images'), { recursive: true });

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error('Failed to save image:', err);
      } else {
        console.log(`Image saved: ${filename}`);
      }
    });

    // Optionally broadcast to Unity too
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

