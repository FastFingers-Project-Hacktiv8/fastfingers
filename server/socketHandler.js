const { Server } = require("socket.io");
const { generateRandomWordsByAi } = require("./helpers/gemini");

// Global game state
let gameState = {
  status: "waiting", // waiting, countdown, playing, finished
  players: new Map(),
  userSessions: new Map(), // Track users by username to prevent duplicates
  text: "",
  startTime: null,
  timeLimit: 60, // Default time limit in seconds
  gameTimer: null, // Server-side timer
  countdownTimer: null,
};

// Helper function to calculate CPM (Characters Per Minute) - Fixed version
function calculateCPM(correctChars, gameStartTime) {
  if (!gameStartTime) return 0;
  const timeElapsed = Date.now() - gameStartTime;
  if (timeElapsed <= 0) return 0;
  const minutes = timeElapsed / 60000; // Convert ms to minutes
  return Math.round(correctChars / minutes);
}

// Helper function to calculate accuracy
function calculateAccuracy(correctChars, totalChars) {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}

// Helper function to get sorted players by CPM
function getSortedPlayersByCpm() {
  return Array.from(gameState.players.values()).sort((a, b) => {
    // First sort by finished status (finished players first)
    if (a.finished && !b.finished) return 1;
    if (!a.finished && b.finished) return -1;

    // Then sort by position for finished players
    if (a.finished && b.finished) {
      return a.position - b.position;
    }

    // For unfinished players, sort by CPM (highest first)
    return b.cpm - a.cpm;
  });
}

// Helper function to end the game
function endGame(io) {
  gameState.status = "finished";

  // Clear any existing timers
  if (gameState.gameTimer) {
    clearTimeout(gameState.gameTimer);
    gameState.gameTimer = null;
  }

  // Sort players by finish time and assign positions
  const finishedPlayers = Array.from(gameState.players.values())
    .filter((p) => p.finished)
    .sort((a, b) => (a.finishTime || Infinity) - (b.finishTime || Infinity));

  finishedPlayers.forEach((player, index) => {
    if (player.position === 0) {
      player.position = index + 1;
    }
  });

  console.log(
    "Game ended, final results:",
    finishedPlayers.map((p) => ({
      username: p.username,
      position: p.position,
      cpm: p.cpm,
    }))
  );

  // Send final results sorted by position
  io.emit("gameFinished", {
    results: getSortedPlayersByCpm(),
  });
}

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // Periodic CPM update for all players (updates every 2 seconds during game)
  let gameUpdateInterval = null;

  const startGameUpdates = () => {
    if (gameUpdateInterval) clearInterval(gameUpdateInterval);

    gameUpdateInterval = setInterval(() => {
      if (gameState.status === "playing" && gameState.startTime) {
        let shouldUpdate = false;

        // Recalculate CPM for all players based on current game time
        gameState.players.forEach((player) => {
          if (!player.isSpectator && !player.finished) {
            const newCpm = calculateCPM(
              player.correctChars,
              gameState.startTime
            );
            if (newCpm !== player.cpm) {
              player.cpm = newCpm;
              shouldUpdate = true;
            }
          }
        });

        // Only broadcast if there were changes
        if (shouldUpdate) {
          io.emit("playersUpdate", {
            players: getSortedPlayersByCpm(),
            gameStatus: gameState.status,
            text: gameState.text,
          });
        }
      }
    }, 2000); // Update every 2 seconds
  };

  const stopGameUpdates = () => {
    if (gameUpdateInterval) {
      clearInterval(gameUpdateInterval);
      gameUpdateInterval = null;
    }
  };

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join the global game
    socket.on("joinGame", (data) => {
      const { username } = data;
      socket.username = username;

      // Check if user is already connected from another session
      const existingSession = gameState.userSessions.get(username);
      if (existingSession && existingSession !== socket.id) {
        // Disconnect the old session
        const oldSocket = io.sockets.sockets.get(existingSession);
        if (oldSocket) {
          oldSocket.emit("duplicateConnection", {
            message: "Another session detected. Disconnecting this one.",
          });
          oldSocket.disconnect();
        }
        gameState.players.delete(existingSession);
      }

      // Register new session
      gameState.userSessions.set(username, socket.id);

      // Check if game is in progress - new players must wait
      if (gameState.status === "playing" || gameState.status === "countdown") {
        // Add as spectator - can watch but not participate
        gameState.players.set(socket.id, {
          username,
          progress: 0,
          cpm: 0,
          accuracy: 100,
          finished: false,
          position: 0,
          startTime: null,
          correctChars: 0,
          totalChars: 0,
          isSpectator: true, // Mark as spectator
        });

        console.log(
          `Player ${username} joined as spectator (game in progress) with socket ${socket.id}`
        );

        socket.emit("gameJoined", {
          gameStatus: gameState.status,
          isSpectator: true,
          message:
            "Game in progress. You'll be able to play in the next round.",
        });

        // Send current game state to spectator so they can see the real-time action
        if (gameState.status === "playing") {
          socket.emit("gameStart", {
            text: gameState.text,
            startTime: gameState.startTime,
            timeLimit: gameState.timeLimit,
          });
        }
      } else {
        // Game is waiting - can join normally
        gameState.players.set(socket.id, {
          username,
          progress: 0,
          cpm: 0,
          accuracy: 100,
          finished: false,
          position: 0,
          startTime: null,
          correctChars: 0,
          totalChars: 0,
          isSpectator: false,
        });

        console.log(`Player ${username} joined with socket ${socket.id}`);

        socket.emit("gameJoined", {
          gameStatus: gameState.status,
          isSpectator: false,
        });
      }

      // Broadcast updated player list sorted by CPM
      io.emit("playersUpdate", {
        players: getSortedPlayersByCpm(),
        gameStatus: gameState.status,
        text: gameState.text,
      });
    });

    // Start game
    socket.on("startGame", async (data) => {
      if (gameState.status !== "waiting") return;

      // Check if the player trying to start is a spectator
      const player = gameState.players.get(socket.id);
      if (player && player.isSpectator) {
        socket.emit("error", {
          message: "Spectators cannot start games. Wait for the next round.",
        });
        return;
      }

      try {
        let randomText;
        let timeLimit = data && data.timeLimit ? data.timeLimit : 60; // Default to 60 seconds

        // Check if text is provided in the request, otherwise generate new text
        if (data && data.text) {
          randomText = data.text;
        } else {
          // Generate random words using your existing helper
          randomText = await generateRandomWordsByAi();
        }

        gameState.status = "countdown";
        gameState.text = randomText;
        gameState.timeLimit = timeLimit;

        console.log(
          "Starting game with text:",
          randomText.substring(0, 50) + "...",
          "Time limit:",
          timeLimit + "s"
        );

        // Start countdown
        let countdown = 3;
        const countdownInterval = setInterval(() => {
          io.emit("countdown", countdown);
          countdown--;

          if (countdown < 0) {
            clearInterval(countdownInterval);
            gameState.status = "playing";
            gameState.startTime = Date.now();

            // Start periodic updates
            startGameUpdates();

            io.emit("gameStart", {
              text: gameState.text,
              startTime: gameState.startTime,
              timeLimit: gameState.timeLimit,
            });

            // Set server-side time limit enforcement
            gameState.gameTimer = setTimeout(() => {
              if (gameState.status === "playing") {
                console.log("Server: Time limit reached, ending game");
                endGame(io);
              }
            }, timeLimit * 1000);
          }
        }, 1000);
      } catch (error) {
        console.error("Error generating words:", error);
        socket.emit("error", { message: "Failed to generate words" });
      }
    });

    // Update typing progress
    socket.on("typingUpdate", (data) => {
      const { userInput, currentIndex, startTime, textLength } = data;

      if (gameState.status !== "playing") return;

      const player = gameState.players.get(socket.id);
      if (!player || player.isSpectator) return; // Spectators can't participate

      // Set player start time if this is their first input (for individual tracking)
      if (!player.startTime && userInput.length > 0) {
        player.startTime = Date.now();
      }

      // Calculate progress
      const progress =
        textLength > 0 ? (userInput.length / textLength) * 100 : 0;
      player.progress = Math.min(progress, 100);

      // Calculate correct characters and total characters typed
      let correctChars = 0;
      let totalChars = userInput.length;

      for (let i = 0; i < userInput.length && i < gameState.text.length; i++) {
        if (userInput[i] === gameState.text[i]) {
          correctChars++;
        }
      }

      player.correctChars = correctChars;
      player.totalChars = totalChars;

      // Calculate CPM and accuracy - Use game start time instead of player start time
      if (gameState.startTime) {
        // CPM based on total game time (will decrease if player stops typing)
        player.cpm = calculateCPM(correctChars, gameState.startTime);
        player.accuracy = calculateAccuracy(correctChars, totalChars);
      } else {
        player.cpm = 0;
        player.accuracy =
          totalChars > 0 ? calculateAccuracy(correctChars, totalChars) : 100;
      }

      // Check if player finished
      if (progress >= 100 && userInput === gameState.text && !player.finished) {
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

      // Broadcast progress to all players with individual player update
      io.emit("playerProgress", {
        playerId: socket.id,
        username: player.username,
        progress: player.progress,
        cpm: player.cpm,
        accuracy: player.accuracy,
        finished: player.finished,
        position: player.position,
      });

      // Broadcast updated sorted player list
      io.emit("playersUpdate", {
        players: getSortedPlayersByCpm(),
        gameStatus: gameState.status,
        text: gameState.text,
      });

      // Check if all players finished
      const allFinished = Array.from(gameState.players.values()).every(
        (p) => p.finished
      );
      if (allFinished && gameState.players.size > 0) {
        endGame(io);
      }
    });

    // Handle time up
    socket.on("timeUp", () => {
      const player = gameState.players.get(socket.id);
      if (!player || player.finished) return;

      player.finished = true;
      player.finishTime = Date.now();

      console.log(`Player ${player.username} time is up`);

      // Check if all players are finished
      let allFinished = true;
      gameState.players.forEach((p) => {
        if (!p.finished) allFinished = false;
      });

      if (allFinished) {
        endGame(io);
      }
    });

    // Reset game
    socket.on("resetGame", () => {
      // Stop periodic updates
      stopGameUpdates();

      gameState.status = "waiting";
      gameState.startTime = null;
      gameState.text = "";
      gameState.timeLimit = 60;

      // Clear any existing timers
      if (gameState.gameTimer) {
        clearTimeout(gameState.gameTimer);
        gameState.gameTimer = null;
      }

      // Reset all players and convert spectators to active players
      gameState.players.forEach((player) => {
        player.progress = 0;
        player.cpm = 0;
        player.accuracy = 100;
        player.finished = false;
        player.position = 0;
        player.startTime = null;
        player.correctChars = 0;
        player.totalChars = 0;
        player.isSpectator = false; // Convert all spectators to active players
      });

      io.emit("gameReset", {
        players: getSortedPlayersByCpm(),
        gameStatus: gameState.status,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      const player = gameState.players.get(socket.id);
      if (player) {
        console.log(`Player ${player.username} disconnected`);
        // Remove from user sessions
        gameState.userSessions.delete(player.username);
      }

      gameState.players.delete(socket.id);

      // Broadcast updated player list sorted by CPM
      io.emit("playersUpdate", {
        players: getSortedPlayersByCpm(),
        gameStatus: gameState.status,
      });
    });
  });

  // Update endGame function to stop periodic updates
  const originalEndGame = endGame;
  endGame = (io) => {
    stopGameUpdates();
    originalEndGame(io);
  };

  return io;
};

module.exports = initializeSocket;
