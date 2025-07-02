import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [players, setPlayers] = useState([]);
  const [position, setPosition] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isSpectator, setIsSpectator] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [error, setError] = useState(null);

  const getUsername = () => {
    const { username } = jwtDecode(localStorage.getItem("access_token"));
    return username;
  };

  const usernameRef = useRef(getUsername());
  const username = usernameRef.current;

  useEffect(() => {
    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("connected");
      setError(null);
      console.log("Connected to server");
      socket.emit("joinGame", { username });
    });

    socket.on("disconnect", (reason) => {
      setConnectionStatus("disconnected");
      console.log("Disconnected:", reason);
      if (reason === "io server disconnect") {
        setError("Server disconnected the connection");
      } else {
        setError("Connection lost. Attempting to reconnect...");
      }
    });

    socket.on("connect_error", (error) => {
      setConnectionStatus("error");
      setError("Failed to connect to server");
      console.error("Connection error:", error);
    });

    socket.on("reconnect", () => {
      setConnectionStatus("connected");
      setError(null);
    });

    socket.on("gameJoined", ({ gameStatus, isSpectator }) => {
      setGameStatus(gameStatus);
      setIsSpectator(isSpectator);
    });

    socket.on("countdown", (val) => {
      setCountdown(val);
    });

    socket.on("gameStart", ({ text, startTime, timeLimit }) => {
      setText(text);
      setStartTime(startTime);
      setTimeLimit(timeLimit);
      setTimeRemaining(timeLimit);
      setGameStatus("playing");
      setUserInput("");
      setCpm(0);
      setAccuracy(100);
      setErrors(0);
      setCountdown(null);
      setIsComplete(false);
      setGameTime(0);
    });

    socket.on("playerProgress", (data) => {
      setPlayers((prev) =>
        prev.map((p) => (p.username === data.username ? { ...p, ...data } : p))
      );

      if (data.username === username) {
        setCpm(data.cpm || 0);
        setAccuracy(data.accuracy || 100);
        setErrors(data.errors || 0);
      }
    });

    socket.on("playersUpdate", (data) => {
      setPlayers(data.players);
      if (data.gameStatus) setGameStatus(data.gameStatus);
      if (data.text) setText(data.text);
      
      // Update current user stats from server data
      const currentPlayer = data.players.find(p => p.username === username);
      if (currentPlayer) {
        setCpm(currentPlayer.cpm || 0);
        setAccuracy(currentPlayer.accuracy || 100);
        setErrors(currentPlayer.errors || 0);
      }
    });

    socket.on("raceFinished", ({ position }) => {
      setIsComplete(true);
      setPosition(position);
    });

    socket.on("gameFinished", ({ results }) => {
      setPlayers(results);
      setGameStatus("finished");
    });

    socket.on("gameReset", ({ players, gameStatus }) => {
      setPlayers(players);
      setGameStatus(gameStatus);
      setUserInput("");
      setIsComplete(false);
      setStartTime(null);
      setCpm(0);
      setAccuracy(100);
      setErrors(0);
      setGameTime(0);
      setTimeRemaining(timeLimit);
      setCountdown(null);
    });

    return () => socket.disconnect();
  }, [username, timeLimit]);

  useEffect(() => {
    let interval;
    if (gameStatus === "playing" && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setGameTime(elapsed);
        const remaining = Math.max(timeLimit - elapsed, 0);
        setTimeRemaining(remaining);
        if (remaining === 0 && !isSpectator && !isComplete) {
          setIsComplete(true);
          // Don't set gameStatus to "finished" here - let server handle it
          socketRef.current.emit("timeUp");
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus, startTime, timeLimit, isSpectator, isComplete]);

  useEffect(() => {
    // Hapus perhitungan CPM di client, hanya bergantung pada data dari server
  }, [userInput, gameStatus, startTime, text, isSpectator]);

  const setUserInputHandler = (val) => {
    if (!isComplete && !isSpectator) {
      setUserInput(val);
      let correct = 0;
      let err = 0;
      for (let i = 0; i < val.length && i < text.length; i++) {
        if (val[i] === text[i]) correct++;
        else err++;
      }
      socketRef.current.emit("typingUpdate", {
        userInput: val,
        textLength: text.length,
        errors: err,
      });
    }
  };

  const startGame = async () => {
    if (!socketRef.current) return;
    setLoading(true);
    try {
      // Let the server generate AI text
      socketRef.current.emit("startGame", { timeLimit });
    } catch (error) {
      console.error("Error starting game:", error);
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    gameStatus,
    userInput,
    setUserInput: setUserInputHandler,
    text,
    startTime,
    timeLimit,
    setTimeLimit,
    timeRemaining,
    cpm,
    accuracy,
    errors,
    countdown,
    players,
    position,
    isComplete,
    gameTime,
    isSpectator,
    socketConnected: socketRef.current?.connected,
    connectionStatus,
    error,
    loading,
    username,
    startGame,
    resetGame: () => socketRef.current.emit("resetGame"),
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
