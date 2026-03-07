import { app, server, io } from "./config/server.js";
import routes from "./routes/index.js";
import {
  addPlayer,
  removePlayer,
  getPlayers,
  getPlayerById,
  setPlayerWaiting,
} from "./controllers/playerController.js";
import {
  startGame,
  stopGame,
  handleWordSelect,
  isGameInProgress,
  getGameState,
  getDrawerId,
} from "./controllers/gameController.js";
import { handleChat } from "./controllers/chatController.js";

app.use("/", routes);

// ── Socket.IO Events ──
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  io.to(socket.id).emit("send-user-data", {});

  // Register player and handle mid-game joins
  socket.on("recieve-user-data", ({ username, avatar }) => {
    addPlayer(socket.id, username, avatar);

    const players = getPlayers();
    console.log("Players:", players);
    io.emit("updated-players", players);
    io.emit("player-joined", { name: username });

    if (players.length === 2) {
      startGame(io);
    } else if (players.length > 2 && isGameInProgress()) {
      setPlayerWaiting(socket.id, true);
      io.to(socket.id).emit("waiting-for-round", {
        message: "A round is in progress. You'll join when the current turn ends!",
      });

      // Sync current game state and canvas to the spectator
      const gameState = getGameState();
      io.to(socket.id).emit("game-state-sync", gameState);
      const drawerId = getDrawerId();
      if (drawerId) {
        io.to(drawerId).emit("request-canvas-sync", { targetId: socket.id });
      }
      io.emit("updated-players", getPlayers());
    }

    if (players.length >= 2) {
      io.emit("game-already-started", {});
    }
  });

  // Canvas drawing broadcast
  socket.on("sending", (data) => {
    socket.broadcast.emit("receiving", data);
  });

  // Chat message handling
  socket.on("sending-chat", (inputMessage) => {
    handleChat(io, socket, inputMessage);
  });

  // Canvas sync: drawer sends snapshot to a specific joiner
  socket.on("canvas-sync-response", ({ targetId, data }) => {
    io.to(targetId).emit("canvas-sync", data);
  });

  // Word selection by the drawer
  socket.on("word-select", (w) => {
    handleWordSelect(io, w);
  });

  // Player disconnect and cleanup
  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
    const leavingPlayer = getPlayerById(socket.id);
    removePlayer(socket.id);

    const players = getPlayers();
    io.emit("updated-players", players);
    if (leavingPlayer) {
      io.emit("player-left", { name: leavingPlayer.name });
    }
    io.to(socket.id).emit("user-disconnected", {});

    if (players.length <= 1) {
      stopGame(io);
    }
  });
});

// ── Start Server ──
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Scribbly server listening on port ${PORT}`);
});
