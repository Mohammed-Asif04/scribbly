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
} from "./controllers/gameController.js";
import { handleChat } from "./controllers/chatController.js";

// Mount HTTP routes
app.use("/", routes);

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Ask the client for their user data
  io.to(socket.id).emit("send-user-data", {});

  // Receive user data and register the player
  socket.on("recieve-user-data", ({ username, avatar }) => {
    addPlayer(socket.id, username, avatar);

    const players = getPlayers();
    console.log("Players:", players);
    io.emit("updated-players", players);
    io.emit("player-joined", { name: username });

    if (players.length === 2) {
      startGame(io);
    } else if (players.length > 2 && isGameInProgress()) {
      // Mid-game joiner: mark as waiting spectator
      setPlayerWaiting(socket.id, true);
      io.to(socket.id).emit("waiting-for-round", {
        message: "A round is in progress. You'll join when the current turn ends!",
      });
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

  // Chat messages
  socket.on("sending-chat", (inputMessage) => {
    handleChat(io, socket, inputMessage);
  });

  // Word selection by drawer
  socket.on("word-select", (w) => {
    handleWordSelect(io, w);
  });

  // Player disconnect
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

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Scribbly server listening on port ${PORT}`);
});
