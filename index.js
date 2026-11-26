import http from "http";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import config from "./src/config/config.js";
import { attachWebSocketServer } from "./src/websocket/wsServer.js";
import { startDeadlineMonitor } from "./src/controllers/testDeadline.js";

const PORT = config.PORT || 8000;

const server = http.createServer(app);

// Attach WebSockets
attachWebSocketServer(server);

connectDB()
  .then(() => {
    // Start background monitors
    startDeadlineMonitor(15);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`HTTP & WebSocket endpoints ready.`);
    });
  })
  .catch((err) => {
    console.error("Server failed to start:", err.message);
  });
