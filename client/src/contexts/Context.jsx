import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  // All state variables
  const socketRef = useRef(null);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [players, setPlayers] = useState([]);
  const [position, setPosition] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isSpectator, setIsSpectator] = useState(false);
  const [spectatorMessage, setSpectatorMessage] = useState("");

  // Get or create persistent username
  const getUsername = () => {
    let username = localStorage.getItem("fastfingers-username");
    if (!username) {
      username = "Player" + Math.floor(Math.random() * 1000);
      localStorage.setItem("fastfingers-username", username);
    }
    return username;
  };

  const usernameRef = useRef(getUsername());
  const username = usernameRef.current;

  const progress = text.length > 0 ? (userInput.length / text.length) * 100 : 0;

  // Socket connection setup
  useEffect(() => {
    const socket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("joinGame", { username });
    });

    socket.on("connect_error", () => setSocketConnected(false));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("reconnect", () => setSocketConnected(true));

    socket.on("duplicateConnection", (data) => {
      alert("Another session detected. This connection will be closed.");
    });

    // Game events
    socket.on("gameJoined", ({ gameStatus, isSpectator, message }) => {
      setGameStatus(gameStatus);
      setIsSpectator(isSpectator || false);
      if (message) {
        setSpectatorMessage(message);
      }
    });

    socket.on("playersUpdate", (data) => {
      setPlayers(data.players);
      setGameStatus(data.gameStatus);
      if (data.text) setText(data.text);
    });

    socket.on("countdown", (num) => setCountdown(num));

    socket.on("gameStart", ({ text, startTime, timeLimit: serverTimeLimit }) => {
      setText(text);
      setStartTime(startTime || Date.now());
      if (serverTimeLimit) {
        setTimeLimit(serverTimeLimit);
        setTimeRemaining(serverTimeLimit);
      }
      setGameStatus("playing");
      setUserInput("");
      setCurrentIndex(0);
      setIsComplete(false);
      setErrors(0);
      setCpm(0);
      setAccuracy(100);
      setCountdown(null);
      setGameTime(0);
    });

    socket.on("playerProgress", (data) => {
      setPlayers((prev) =>
        prev.map((p) => (p.username === data.username ? { ...p, ...data } : p))
      );

      if (data.username === username) {
        setCpm(data.cpm || 0);
        setAccuracy(data.accuracy || 100);
      }
    });

    socket.on("raceFinished", ({ position }) => {
      setIsComplete(true);
      setPosition(position);
    });

    socket.on("gameFinished", ({ results }) => setPlayers(results));

    socket.on("gameReset", ({ players, gameStatus }) => {
      setPlayers(players);
      setGameStatus(gameStatus);
      setUserInput("");
      setCurrentIndex(0);
      setErrors(0);
      setIsComplete(false);
      setStartTime(null);
      setCpm(0);
      setAccuracy(100);
      setText("");
      setGameTime(0);
      setTimeRemaining(timeLimit);
      setIsSpectator(false);
      setSpectatorMessage("");
    });

    return () => socket.disconnect();
  }, [username, timeLimit]);

  // Timer effect for tracking game time and countdown
  useEffect(() => {
    let interval = null;
    if (gameStatus === "playing" && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(timeLimit - elapsed, 0);

        setGameTime(elapsed);
        setTimeRemaining(remaining);

        // End game when time runs out (only for active players, not spectators)
        if (remaining === 0 && !isComplete && !isSpectator) {
          setIsComplete(true);
          socketRef.current?.emit("timeUp");
        }
      }, 1000);
    } else if (gameStatus !== "playing") {
      setGameTime(0);
      setTimeRemaining(timeLimit);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStatus, startTime, timeLimit, isComplete, isSpectator]);

  // Typing progress handler
  useEffect(() => {
    if (
      text &&
      gameStatus === "playing" &&
      socketRef.current?.connected &&
      !isSpectator
    ) {
      socketRef.current.emit("typingUpdate", {
        userInput: userInput,
        currentIndex: currentIndex,
        startTime: startTime,
        textLength: text.length,
      });

      if (userInput.length >= text.length && userInput === text) {
        setIsComplete(true);
      }
    }
  }, [userInput, currentIndex, startTime, gameStatus, text, isSpectator]);

  // Character tracking for cursor position
  useEffect(() => {
    if (text && gameStatus === "playing") {
      let newErrors = 0;
      let nextCorrectPosition = 0;

      for (let i = 0; i < userInput.length; i++) {
        if (i < text.length) {
          if (userInput[i] === text[i]) {
            nextCorrectPosition = i + 1;
          } else {
            newErrors++;
          }
        }
      }

      if (
        userInput.length > 0 &&
        userInput[userInput.length - 1] === text[userInput.length - 1]
      ) {
        setCurrentIndex(nextCorrectPosition);
      } else if (userInput.length === 0) {
        setCurrentIndex(0);
      }

      setErrors(newErrors);
    }
  }, [userInput, text, gameStatus]);

  // Game functions
  const startGame = async () => {
    if (!socketRef.current?.connected) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/random-words");
      const data = await response.json();
      const aiText = data.text || data;
      setText(aiText);
      socketRef.current.emit("startGame", {
        text: aiText,
        timeLimit: timeLimit,
      });
    } catch (error) {
      const fallbackText =
        "The quick brown fox jumps over the lazy dog. Programming is a fun and creative activity that allows developers to build amazing applications.";
      setText(fallbackText);
      socketRef.current.emit("startGame", {
        text: fallbackText,
        timeLimit: timeLimit,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    socketRef.current?.emit("resetGame");
  };

  const setUserInputHandler = (value) => {
    if (!isComplete && !isSpectator) {
      setUserInput(value);
    }
  };

  const setTimeLimitHandler = (newLimit) => {
    setTimeLimit(newLimit);
    setTimeRemaining(newLimit);
  };

  // Context value
  const contextValue = {
    // Socket
    socketRef,
    socketConnected,
    
    // Game state
    gameStatus,
    text,
    userInput,
    currentIndex,
    startTime,
    isComplete,
    cpm,
    accuracy,
    errors,
    countdown,
    players,
    position,
    loading,
    gameTime,
    timeLimit,
    timeRemaining,
    isSpectator,
    spectatorMessage,
    progress,
    username,
    
    // Actions
    startGame,
    resetGame,
    setUserInput: setUserInputHandler,
    setTimeLimit: setTimeLimitHandler,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
