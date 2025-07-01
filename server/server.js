if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const cors = require("cors");
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const errorHandler = require("./middlewares/errorHandler");
const Controller = require("./controllers/controller");
const { generateRandomWords } = require("./helpers/gemini");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route
app.post("/login", Controller.postLogin);
app.post("/google-login", Controller.postGoogleLogin);
app.post("/register", Controller.postRegister);

app.get("/leaderboard", Controller.getUserByCpmDesc);
app.patch("/user/:id", Controller.patchUserCpmById);
app.get("/random-words", Controller.generateRandomWords);

app.use(errorHandler);

const httpServer = createServer(app);

// socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Global game state
let gameState = {
  status: "waiting", // waiting, countdown, playing, finished
  players: new Map(),
  text: "",
  startTime: null,
  countdownTimer: null,
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join the global game
  socket.on("joinGame", (data) => {
    const { username } = data;
    socket.username = username;

    gameState.players.set(socket.id, {
      username,
      progress: 0,
      cpm: 0,
      accuracy: 100,
      finished: false,
      position: 0,
    });

    // Broadcast updated player list
    io.emit("playersUpdate", {
      players: Array.from(gameState.players.values()),
      gameStatus: gameState.status,
      text: gameState.text,
    });

    socket.emit("gameJoined", { gameStatus: gameState.status });
  });

  // Start game
  socket.on("startGame", async () => {
    if (gameState.status !== "waiting") return;

    try {
      // Generate random words using your existing helper
      const randomText = await generateRandomWords();

      gameState.status = "countdown";
      gameState.text = randomText;

      // Start countdown
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        io.emit("countdown", countdown);
        countdown--;

        if (countdown < 0) {
          clearInterval(countdownInterval);
          gameState.status = "playing";
          gameState.startTime = Date.now();

          io.emit("gameStart", {
            text: gameState.text,
            startTime: gameState.startTime,
          });
        }
      }, 1000);
    } catch (error) {
      console.error("Error generating words:", error);
      socket.emit("error", { message: "Failed to generate words" });
    }
  });

  // Update typing progress
  socket.on("typingUpdate", (data) => {
    const { progress, cpm, accuracy } = data;

    if (gameState.status !== "playing") return;

    const player = gameState.players.get(socket.id);
    if (player) {
      player.progress = progress;
      player.cpm = cpm;
      player.accuracy = accuracy;

      // Check if player finished
      if (progress >= 100 && !player.finished) {
        player.finished = true;
        player.finishTime = Date.now();

        // Assign position based on finish order
        const finishedPlayers = Array.from(gameState.players.values()).filter(
          (p) => p.finished
        );
        player.position = finishedPlayers.length;

        socket.emit("raceFinished", {
          position: player.position,
          cpm: player.cpm,
          accuracy: player.accuracy,
          time: player.finishTime - gameState.startTime,
        });
      }

      // Broadcast progress to all players
      io.emit("playerProgress", {
        playerId: socket.id,
        username: player.username,
        progress: player.progress,
        cpm: player.cpm,
        accuracy: player.accuracy,
        finished: player.finished,
        position: player.position,
      });

      // Check if all players finished
      const allFinished = Array.from(gameState.players.values()).every(
        (p) => p.finished
      );
      if (allFinished && gameState.players.size > 0) {
        gameState.status = "finished";
        io.emit("gameFinished", {
          results: Array.from(gameState.players.values()).sort(
            (a, b) => a.position - b.position
          ),
        });
      }
    }
  });

  // Reset game
  socket.on("resetGame", () => {
    gameState.status = "waiting";
    gameState.startTime = null;
    gameState.text = "";

    // Reset all players
    gameState.players.forEach((player) => {
      player.progress = 0;
      player.cpm = 0;
      player.accuracy = 100;
      player.finished = false;
      player.position = 0;
    });

    io.emit("gameReset", {
      players: Array.from(gameState.players.values()),
      gameStatus: gameState.status,
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    gameState.players.delete(socket.id);

    // Broadcast updated player list
    io.emit("playersUpdate", {
      players: Array.from(gameState.players.values()),
      gameStatus: gameState.status,
    });
  });
});

module.exports = {
  httpServer,
};
