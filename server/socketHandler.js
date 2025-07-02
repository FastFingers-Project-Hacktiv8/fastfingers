const { Server } = require("socket.io");
const generateRandomWordsByAi = require("./helpers/gemini");

let gameState = {
  status: "waiting",
  players: new Map(),
  userSessions: new Map(),
  text: "",
  startTime: null,
  timeLimit: 60,
  gameTimer: null,
  countdownTimer: null,
  realTimeUpdateInterval: null,
};

function calculateCPM(correctChars, playerStartTime) {
  if (!playerStartTime) return 0;
  const timeElapsed = Date.now() - playerStartTime;
  if (timeElapsed <= 0) return 0;
  const minutes = timeElapsed / 60000;
  return Math.round(correctChars / minutes);
}

function calculateAccuracy(correctChars, totalChars) {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}

function getSortedPlayersByCpm() {
  return Array.from(gameState.players.values()).sort((a, b) => {
    if (a.finished && !b.finished) return 1;
    if (!a.finished && b.finished) return -1;
    if (a.finished && b.finished) return a.position - b.position;
    return b.cpm - a.cpm;
  });
}

function endGame(io) {
  gameState.status = "finished";
  clearTimeout(gameState.gameTimer);
  clearInterval(gameState.realTimeUpdateInterval);
  gameState.gameTimer = null;
  gameState.realTimeUpdateInterval = null;

  const finishedPlayers = Array.from(gameState.players.values())
    .filter((p) => p.finished)
    .sort((a, b) => (a.finishTime || Infinity) - (b.finishTime || Infinity));

  finishedPlayers.forEach((player, index) => {
    if (player.position === 0) player.position = index + 1;
  });

  io.emit("gameFinished", { results: getSortedPlayersByCpm() });
}

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.on("joinGame", ({ username }) => {
      const existingSession = gameState.userSessions.get(username);
      if (existingSession && existingSession !== socket.id) {
        const oldSocket = io.sockets.sockets.get(existingSession);
        if (oldSocket) oldSocket.disconnect();
        gameState.players.delete(existingSession);
      }
      gameState.userSessions.set(username, socket.id);

      const isSpectator = ["playing", "countdown"].includes(gameState.status);
      gameState.players.set(socket.id, {
        username,
        progress: 0,
        cpm: 0,
        accuracy: 100,
        errors: 0,
        finished: false,
        position: 0,
        correctChars: 0,
        totalChars: 0,
        startTime: null,
        isSpectator,
      });

      socket.emit("gameJoined", {
        gameStatus: gameState.status,
        isSpectator,
        ...(isSpectator && {
          message: "Game in progress. You'll be able to play next round.",
        }),
      });

      if (gameState.status === "playing") {
        socket.emit("gameStart", {
          text: gameState.text,
          startTime: gameState.startTime,
          timeLimit: gameState.timeLimit,
        });
      }

      io.emit("playersUpdate", {
        players: getSortedPlayersByCpm(),
        gameStatus: gameState.status,
        text: gameState.text,
      });
    });

    socket.on("startGame", async ({ timeLimit = 60 }) => {
      if (!["waiting", "finished"].includes(gameState.status)) return;

      const player = gameState.players.get(socket.id);
      if (!player) return;

      // Reset semua pemain agar bisa main ketika game dimulai
      gameState.players.forEach((p) => {
        Object.assign(p, {
          progress: 0,
          cpm: 0,
          accuracy: 100,
          errors: 0,
          finished: false,
          position: 0,
          correctChars: 0,
          totalChars: 0,
          startTime: null,
          isSpectator: false, // Semua pemain yang sudah bergabung bisa main
        });
      });

      gameState.status = "countdown";

      try {
        // Generate AI text for the race
        gameState.text = await generateRandomWordsByAi();
      } catch (error) {
        console.error("Error generating AI text:", error);
        // Fallback text
        gameState.text =
          "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!";
      }

      gameState.timeLimit = timeLimit;

      let countdown = 3;
      const countdownInterval = setInterval(() => {
        io.emit("countdown", countdown--);
        if (countdown < 0) {
          clearInterval(countdownInterval);
          gameState.status = "playing";
          gameState.startTime = Date.now();

          io.emit("gameStart", {
            text: gameState.text,
            startTime: gameState.startTime,
            timeLimit: gameState.timeLimit,
          });

          // Update semua pemain dengan status terbaru
          io.emit("playersUpdate", {
            players: getSortedPlayersByCpm(),
            gameStatus: gameState.status,
            text: gameState.text,
          });

          // Mulai real-time CPM update setiap detik
          gameState.realTimeUpdateInterval = setInterval(() => {
            let hasUpdate = false;
            gameState.players.forEach((player) => {
              if (player.startTime && !player.finished && !player.isSpectator) {
                const newCpm = calculateCPM(
                  player.correctChars,
                  player.startTime
                );
                if (newCpm !== player.cpm) {
                  player.cpm = newCpm;
                  hasUpdate = true;
                  
                  // Emit individual player progress
                  io.emit("playerProgress", {
                    username: player.username,
                    progress: player.progress,
                    cpm: player.cpm,
                    accuracy: player.accuracy,
                    errors: player.errors,
                    finished: player.finished,
                    position: player.position,
                  });
                }
              }
            });

            if (hasUpdate) {
              io.emit("playersUpdate", {
                players: getSortedPlayersByCpm(),
                gameStatus: gameState.status,
                text: gameState.text,
              });
            }
          }, 1000);

          gameState.gameTimer = setTimeout(() => {
            if (gameState.status === "playing") endGame(io);
          }, timeLimit * 1000);
        }
      }, 1000);
    });

    socket.on("typingUpdate", ({ userInput, textLength, errors }) => {
      if (gameState.status !== "playing") return;

      const player = gameState.players.get(socket.id);
      if (!player || player.isSpectator) return;

      if (!player.startTime && userInput.length > 0) {
        player.startTime = Date.now();
      }

      const correctChars = [...userInput].filter(
        (c, i) => c === gameState.text[i]
      ).length;
      player.correctChars = correctChars;
      player.totalChars = userInput.length;
      player.progress = Math.min((userInput.length / textLength) * 100, 100);

      // Gunakan player.startTime untuk CPM real-time per pemain
      player.cpm = calculateCPM(correctChars, player.startTime);
      player.accuracy = calculateAccuracy(correctChars, userInput.length);
      player.errors = errors || 0; // Set errors dari client

      if (
        !player.finished &&
        player.progress >= 100 &&
        userInput === gameState.text
      ) {
        player.finished = true;
        player.finishTime = Date.now();
        player.position = [...gameState.players.values()].filter(
          (p) => p.finished
        ).length;
        socket.emit("raceFinished", {
          position: player.position,
          cpm: player.cpm,
        });
      }

      io.emit("playerProgress", {
        username: player.username,
        progress: player.progress,
        cpm: player.cpm,
        accuracy: player.accuracy,
        errors: player.errors,
        finished: player.finished,
        position: player.position,
      });

      io.emit("playersUpdate", {
        players: getSortedPlayersByCpm(),
        gameStatus: gameState.status,
        text: gameState.text,
      });

      const allDone = [...gameState.players.values()].every((p) => p.finished);
      if (allDone) endGame(io);
    });

    socket.on("timeUp", () => {
      const player = gameState.players.get(socket.id);
      if (player && !player.finished) {
        player.finished = true;
        player.finishTime = Date.now();
      }

      const allDone = [...gameState.players.values()].every((p) => p.finished);
      if (allDone) endGame(io);
    });

    socket.on("resetGame", () => {
      gameState.status = "waiting";
      gameState.text = "";
      gameState.startTime = null;
      gameState.timeLimit = 60;
      clearTimeout(gameState.gameTimer);
      clearInterval(gameState.realTimeUpdateInterval);
      gameState.gameTimer = null;
      gameState.realTimeUpdateInterval = null;

      gameState.players.forEach((p) => {
        Object.assign(p, {
          progress: 0,
          cpm: 0,
          accuracy: 100,
          errors: 0,
          finished: false,
          position: 0,
          correctChars: 0,
          totalChars: 0,
          startTime: null,
          isSpectator: false,
        });
      });

      io.emit("gameReset", {
        players: getSortedPlayersByCpm(),
        gameStatus: gameState.status,
      });
    });

    socket.on("disconnect", () => {
      const player = gameState.players.get(socket.id);
      if (player) gameState.userSessions.delete(player.username);
      gameState.players.delete(socket.id);

      io.emit("playersUpdate", {
        players: getSortedPlayersByCpm(),
        gameStatus: gameState.status,
      });
    });
  });

  return io;
};

module.exports = initializeSocket;
