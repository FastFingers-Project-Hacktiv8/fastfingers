import { Play, Timer, Loader2 } from "lucide-react";

export default function GameControls({
  gameStatus,
  timeLimit,
  setTimeLimit,
  startGame,
  socketConnected,
  loading,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center mb-6">
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Play className="h-5 w-5 text-gray-600" />
          <p className="text-lg text-gray-800 font-medium">Ready to Race?</p>
        </div>
        <p className="text-sm text-gray-600">
          Any player can start the race for everyone!
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="flex items-center gap-3">
          <Timer className="h-5 w-5 text-gray-600" />
          <label className="text-gray-800 font-medium">Duration:</label>
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={120}>2 minutes</option>
          </select>
        </div>
        <button
          onClick={startGame}
          disabled={!socketConnected || loading}
          className="px-8 py-3 bg-gradient-to-r from-gray-800 to-black text-white font-bold rounded-xl hover:from-gray-900 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Starting...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              {gameStatus === "finished" ? "Start New Race" : "Start Race"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
