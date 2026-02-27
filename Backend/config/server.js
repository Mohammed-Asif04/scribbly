import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// HTTP server
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
  connectionStateRecovery: {},
});

export { app, server, io };
