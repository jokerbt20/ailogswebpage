const express = require("express");
const WebSocket = require("ws");
var bodyParser = require('body-parser');
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const wss = new WebSocket.Server({ noServer: true });

let clients = [];

wss.on("connection", (ws) => {
  console.log("A new WebSocket client connected");
  clients.push(ws); 

  ws.on("close", () => {
    clients = clients.filter(client => client !== ws);
    console.log("WebSocket client disconnected");
  });
});


app.post("/send-data", (req, res) => {

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(req.body)); 
    }
  });

  res.json({ success: true });
});

app.server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});