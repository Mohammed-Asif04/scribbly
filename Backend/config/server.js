import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Express app setup
const app = express();
app.use(cors());
app.use(express.json());

// HTTP + Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
  connectionStateRecovery: {},
});

export { app, server, io };
