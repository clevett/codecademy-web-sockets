///////////////////////////////////////////////
///////////// IMPORTS + VARIABLES /////////////
///////////////////////////////////////////////

const http = require("http");
const CONSTANTS = require("./utils/constants.js");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

// You may choose to use the constants defined in the file below
const { PORT, CLIENT } = CONSTANTS;

///////////////////////////////////////////////
///////////// HTTP SERVER LOGIC ///////////////
///////////////////////////////////////////////

// Create the HTTP server
const server = http.createServer((req, res) => {
  // get the file path from req.url, or '/public/index.html' if req.url is '/'
  const filePath = req.url === "/" ? "/public/index.html" : req.url;

  // determine the contentType by the file extension
  const extname = path.extname(filePath);
  let contentType = "text/html";
  if (extname === ".js") contentType = "text/javascript";
  else if (extname === ".css") contentType = "text/css";

  // pipe the proper file to the res object
  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(`${__dirname}/${filePath}`, "utf8").pipe(res);
});

///////////////////////////////////////////////
////////////////// WS LOGIC ///////////////////
///////////////////////////////////////////////

const wsServer = new WebSocket.Server({ server });

wsServer.on("connection", (socket) => {
  console.log("New user connected! :)");

  socket.on("message", (data) => {
    broadcast(data, socket);
  });
});

///////////////////////////////////////////////
////////////// HELPER FUNCTIONS ///////////////
///////////////////////////////////////////////

function broadcast(data, socketToOmit) {
  wsServer.clients.forEach((client) => {
    if (client !== socketToOmit && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Start the server listening on localhost:8080
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});
