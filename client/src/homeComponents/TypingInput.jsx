import { Zap } from "lucide-react";

export default function TypingInput({ gameStatus, userInput, setUserInput }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="relative">
        <input
          className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-xl font-mono text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
          placeholder={
            gameStatus === "waiting"
              ? "Waiting for race to start..."
              : "Start typing here..."
          }
          disabled={gameStatus !== "playing"}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          autoFocus
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <Zap className="h-6 w-6 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
