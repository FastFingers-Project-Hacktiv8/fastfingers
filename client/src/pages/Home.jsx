import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://api.p2.lc2s6.foxhub.space"); // Ganti sesuai domain backend kamu

export default function Home() {
  const inputRef = useRef(null);
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

  const username = "Player" + Math.floor(Math.random() * 1000);
  const progress = (currentIndex / text.length) * 100;
  const carPosition = Math.min(progress, 100);

  useEffect(() => {
    socket.emit("joinGame", { username });

    socket.on("gameJoined", ({ gameStatus }) => {
      setGameStatus(gameStatus);
    });

    socket.on("playersUpdate", (data) => {
      setPlayers(data.players);
      setGameStatus(data.gameStatus);
      setText(data.text);
    });

    socket.on("countdown", (num) => {
      setCountdown(num);
    });

    socket.on("gameStart", ({ text, startTime }) => {
      setText(text);
      setStartTime(startTime);
      setGameStatus("playing");
      setUserInput("");
      setCurrentIndex(0);
      setIsComplete(false);
      setErrors(0);
      setCpm(0);
      setAccuracy(100);
      if (inputRef.current) inputRef.current.focus();
    });

    socket.on("playerProgress", (data) => {
      setPlayers((prev) =>
        prev.map((p) => (p.username === data.username ? { ...p, ...data } : p))
      );
    });

    socket.on("raceFinished", ({ position }) => {
      setIsComplete(true);
      setPosition(position);
    });

    socket.on("gameFinished", ({ results }) => {
      setPlayers(results);
    });

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
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (userInput.length === 1 && !startTime) {
      setStartTime(Date.now());
    }

    if (text && userInput.length > 0 && gameStatus === "playing") {
      const correctChar = text[currentIndex];
      const typedChar = userInput[userInput.length - 1];

      if (typedChar === correctChar) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setErrors((prev) => prev + 1);
      }

      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const chars = currentIndex;
      const acc =
        userInput.length > 0
          ? Math.round((currentIndex / userInput.length) * 100)
          : 100;
      setCpm(Math.round(chars / elapsed));
      setAccuracy(acc);

      socket.emit("typingUpdate", {
        progress: ((currentIndex + 1) / text.length) * 100,
        cpm: Math.round(chars / elapsed),
        accuracy: acc,
      });

      if (currentIndex + 1 >= text.length) {
        setIsComplete(true);
      }
    }
  }, [userInput]);

  const startGame = () => {
    socket.emit("startGame");
  };

  const resetGame = () => {
    socket.emit("resetGame");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-green-100 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white shadow p-4 rounded-lg text-center">
          <h1 className="text-3xl font-bold text-blue-600">🚗 Typing Race</h1>
        </div>

        {countdown !== null && (
          <div className="bg-red-100 text-red-600 text-center text-3xl font-bold p-4 rounded-lg">
            Starting in {countdown}...
          </div>
        )}

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="relative h-28 bg-gray-200 rounded overflow-hidden">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-400 -translate-y-1/2" />
            <div
              className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-300"
              style={{ left: `${carPosition}%` }}
            >
              <div className="text-red-600 text-4xl">🚗</div>
            </div>
          </div>
          <div className="mt-2 bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow font-mono leading-relaxed">
          {text.split("").map((char, index) => (
            <span
              key={index}
              className={`${
                index < currentIndex
                  ? "bg-green-200 text-green-800"
                  : index === currentIndex
                  ? "bg-blue-200 text-blue-800 animate-pulse"
                  : "text-gray-600"
              }`}
            >
              {char}
            </span>
          ))}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => !isComplete && setUserInput(e.target.value)}
            disabled={isComplete || gameStatus !== "playing"}
            placeholder="Start typing here..."
            className="w-full p-4 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white p-4 rounded shadow">
            <div className="text-xl font-bold text-blue-600">{cpm}</div>
            <div className="text-sm text-gray-600">CPM</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-xl font-bold text-green-600">{accuracy}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-xl font-bold text-red-600">{errors}</div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
        </div>

        <div className="text-center space-x-4">
          <button
            onClick={startGame}
            disabled={gameStatus !== "waiting"}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Start Game
          </button>
          <button
            onClick={resetGame}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
          >
            Reset
          </button>
        </div>

        {isComplete && (
          <div className="bg-green-100 border border-green-400 p-4 rounded text-center shadow">
            <div className="text-yellow-500 text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold text-green-800 mb-1">
              Race Complete!
            </h2>
            <p className="text-green-700">
              You finished at position #{position}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
