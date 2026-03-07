import { getPlayers, activateWaitingPlayers } from "./playerController.js";

// ── Game State ──
let drawerIndex = 0;
let word = null;
let timeout = null;
let timerInterval = null;
let drawStartTime = null;
const TURN_DURATION = 75;
let round = 1;
const TOTAL_ROUNDS = 3;
let playerGuessedRightWord = [];

const clearTimers = () => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  drawStartTime = null;
};

// ── Game Lifecycle ──

export const startGame = (io) => {
  console.log("Game started");
  round = 1;
  drawerIndex = 0;
  io.emit("game-start", {});
  io.emit("round-update", { round, totalRounds: TOTAL_ROUNDS });
  startTurn(io);
};

export const stopGame = (io) => {
  console.log("Game stopped");
  const players = getPlayers();
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  io.emit("game-over", { players: sortedPlayers });
  io.emit("game-stop", {});
  drawerIndex = 0;
  round = 1;
  clearTimers();
};

// ── Turn Management ──

export const startTurn = (io) => {
  const players = getPlayers();
  if (players.length === 0) return;

  if (drawerIndex >= players.length) {
    drawerIndex = 0;
  }

  io.emit("start-turn", players[drawerIndex]);
};

export const startDraw = (io) => {
  const players = getPlayers();
  io.emit("start-draw", players[drawerIndex]);

  // Start server-authoritative timer and broadcast every second
  drawStartTime = Date.now();
  io.emit("timer-sync", TURN_DURATION);

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - drawStartTime) / 1000);
    const remaining = Math.max(0, TURN_DURATION - elapsed);
    io.emit("timer-sync", remaining);

    if (remaining <= 0) {
      clearTimers();
      endTurn(io);
    }
  }, 1000);
};

export const endTurn = (io) => {
  const players = getPlayers();
  io.emit("end-turn", { player: players[drawerIndex], word });

  playerGuessedRightWord = [];
  clearTimers();
  io.emit("clear-canvas");

  // Activate spectators so they participate in the next turn
  activateWaitingPlayers();
  io.emit("waiting-players-activated");
  io.emit("updated-players", getPlayers());

  // Advance drawer; if wrapped around, advance the round
  const nextDrawerIndex = (drawerIndex + 1) % players.length;

  if (nextDrawerIndex <= drawerIndex || players.length === 1) {
    round++;
    io.emit("round-update", { round, totalRounds: TOTAL_ROUNDS });

    if (round > TOTAL_ROUNDS) {
      console.log("All rounds complete, stopping game");
      stopGame(io);
      return;
    }
  }

  drawerIndex = nextDrawerIndex;
  startTurn(io);
};

// ── Word Selection ──

export const handleWordSelect = (io, w) => {
  word = w;
  const wordLength = w.length;
  io.emit("word-len", wordLength);
  startDraw(io);
};

// ── State Accessors ──

export const getCurrentWord = () => word;

export const getPlayerGuessedRightWord = () => playerGuessedRightWord;

export const addPlayerGuessedRight = (playerId) => {
  playerGuessedRightWord.push(playerId);
};

export const resetPlayerGuessedRight = () => {
  playerGuessedRightWord = [];
};

export const getRemainingTime = () => {
  if (!drawStartTime) return 0;
  const elapsed = Math.floor((Date.now() - drawStartTime) / 1000);
  return Math.max(0, TURN_DURATION - elapsed);
};

export const getTurnDuration = () => TURN_DURATION;

export const getDrawerId = () => {
  const players = getPlayers();
  if (players.length === 0 || drawerIndex >= players.length) return null;
  return players[drawerIndex].id;
};

export const isGameInProgress = () => drawStartTime !== null;

export const getGameState = () => {
  const players = getPlayers();
  const drawerPlayer = players.length > 0 && drawerIndex < players.length
    ? players[drawerIndex]
    : null;
  return {
    drawerPlayer,
    wordLength: word ? word.length : 0,
    word: word || null,
    remainingTime: getRemainingTime(),
    round,
    totalRounds: TOTAL_ROUNDS,
  };
};
