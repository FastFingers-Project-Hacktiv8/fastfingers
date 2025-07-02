import { useSocket } from "../contexts/Context";

export default function Home() {
  const {
    gameStatus,
    userInput,
    setUserInput,
    text,
    timeRemaining,
    isSpectator,
    cpm,
    accuracy,
    errors,
    players,
    username,
    countdown,
    position,
    isComplete,
    gameTime,
    startGame,
    resetGame,
    socketConnected,
    connectionStatus,
    error,
    loading,
    timeLimit,
    setTimeLimit,
  } = useSocket();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = (player) => {
    if (!text) return 0;
    return Math.min(player.progress || 0, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🏎️ Fast Fingers Race
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                👥 {players.filter((p) => !p.isSpectator).length} Racing • 👀{" "}
                {players.filter((p) => p.isSpectator).length} Watching
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  connectionStatus === "connected"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {connectionStatus === "connected"
                  ? "🟢 Connected"
                  : "🔴 Disconnected"}
              </div>
              {gameStatus === "playing" && (
                <div className="text-2xl font-bold text-yellow-400">
                  ⏰ {formatTime(timeRemaining)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Race Track with Cars */}
        {(gameStatus === "playing" || gameStatus === "finished") && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-center">
              🏁 Race Track
            </h2>
            <div className="space-y-3">
              {players.slice(0, 5).map((player, index) => (
                <div key={player.username} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-medium ${
                        player.username === username
                          ? "text-yellow-400"
                          : "text-white"
                      }`}
                    >
                      {player.username}{" "}
                      {player.username === username ? "(You)" : ""}
                    </span>
                    <span className="text-sm text-gray-300">
                      {player.cpm || 0} CPM
                    </span>
                  </div>
                  <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-300 to-gray-400"
                          : index === 2
                          ? "bg-gradient-to-r from-orange-600 to-red-500"
                          : "bg-gradient-to-r from-blue-400 to-purple-500"
                      }`}
                      style={{ width: `${getProgress(player)}%` }}
                    ></div>
                    <div
                      className="absolute top-1 text-lg transition-all duration-300"
                      style={{
                        left: `${Math.max(getProgress(player) - 2, 0)}%`,
                      }}
                    >
                      🏎️
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Typing Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Countdown */}
            {countdown !== null && countdown > 0 && (
              <div className="text-center">
                <div className="text-8xl font-bold text-yellow-400 animate-bounce mb-4">
                  {countdown}
                </div>
                <p className="text-xl text-gray-300">Get ready to race!</p>
              </div>
            )}

            {/* Stats during game */}
            {gameStatus === "playing" && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold text-blue-400">
                      {cpm}
                    </div>
                    <div className="text-sm text-gray-300">CPM</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-green-400">
                      {accuracy}%
                    </div>
                    <div className="text-sm text-gray-300">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-red-400">
                      {errors}
                    </div>
                    <div className="text-sm text-gray-300">Errors</div>
                  </div>
                </div>
              </div>
            )}

            {/* Text Display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="font-mono text-lg leading-relaxed text-justify break-words overflow-hidden">
                {text.split("").map((char, i) => {
                  let className = "text-gray-400";
                  if (i < userInput.length) {
                    className =
                      userInput[i] === char
                        ? "text-green-400 bg-green-400/20 rounded"
                        : "text-red-400 bg-red-400/20 rounded";
                  } else if (
                    i === userInput.length &&
                    gameStatus === "playing"
                  ) {
                    className =
                      "bg-yellow-400 text-black animate-pulse rounded";
                  }
                  return (
                    <span key={i} className={className + " px-1"}>
                      {char === " " ? "\u00A0" : char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Input Field */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <input
                className="w-full p-4 bg-black/30 border border-white/30 rounded-lg text-xl font-mono text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                placeholder={
                  isSpectator
                    ? "👀 Spectating..."
                    : gameStatus === "waiting"
                    ? "Waiting for race to start..."
                    : "Start typing here..."
                }
                disabled={isSpectator || gameStatus !== "playing"}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                autoFocus
              />
            </div>

            {/* Game Controls */}
            {(gameStatus === "waiting" || gameStatus === "finished") && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-2">
                    🎮 Any player can start the race for everyone!
                  </p>
                  <p className="text-xs text-gray-400">
                    New players joining during the race will be spectators
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-white font-medium">
                      Race Duration:
                    </label>
                    <select
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                      className="bg-black/50 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                    >
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={120}>2 minutes</option>
                    </select>
                  </div>
                  <button
                    onClick={startGame}
                    disabled={!socketConnected || loading}
                    className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  >
                    {loading
                      ? "🔄 Starting..."
                      : gameStatus === "finished"
                      ? "🏁 Start New Race"
                      : "🏁 Start Race"}
                  </button>
                </div>
              </div>
            )}

            {/* Spectator Message - hanya tampil saat game sedang berlangsung */}
            {(gameStatus === "playing" || gameStatus === "countdown") &&
              isSpectator && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 text-center">
                  <p className="text-yellow-300 font-medium mb-2">
                    👀 You're spectating this round
                  </p>
                  <p className="text-yellow-200 text-sm">
                    You joined while a race was in progress. You can play in the
                    next race!
                  </p>
                </div>
              )}

            {/* Game Complete */}
            {isComplete && (
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/50 rounded-xl p-8 text-center">
                <h3 className="text-3xl font-bold text-green-400 mb-4">
                  🏁 Race Complete!
                </h3>
                <p className="text-xl text-green-300 mb-4">
                  Position: #{position}
                </p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {cpm}
                    </div>
                    <div className="text-sm text-gray-300">Final CPM</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {accuracy}%
                    </div>
                    <div className="text-sm text-gray-300">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {errors}
                    </div>
                    <div className="text-sm text-gray-300">Errors</div>
                  </div>
                </div>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-200 shadow-lg"
                >
                  🔄 Race Again
                </button>
              </div>
            )}

            {/* Game Finished - Show Final Results */}
            {gameStatus === "finished" && !isComplete && (
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 rounded-xl p-8 text-center">
                <h3 className="text-3xl font-bold text-blue-400 mb-4">
                  🏁 Race Finished!
                </h3>
                <p className="text-xl text-blue-300 mb-4">
                  Time's up! Check the leaderboard for final results.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {cpm}
                    </div>
                    <div className="text-sm text-gray-300">Final CPM</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {accuracy}%
                    </div>
                    <div className="text-sm text-gray-300">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {errors}
                    </div>
                    <div className="text-sm text-gray-300">Errors</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Players & Leaderboard */}
          <div className="space-y-6">
            {/* Current Players */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold mb-4 text-center">
                👥 Race Participants
              </h2>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={player.username}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      player.username === username
                        ? "bg-yellow-500/20 border-yellow-500/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {player.isSpectator
                            ? "👀"
                            : player.finished
                            ? "🏁"
                            : index === 0
                            ? "🥇"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : "🏎️"}
                        </span>
                        <div>
                          <div className="font-medium">
                            {player.username}
                            {player.username === username && (
                              <span className="ml-2 text-xs bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          {gameStatus === "playing" && (
                            <div className="w-24 bg-gray-600 rounded-full h-1 mt-1">
                              <div
                                className="bg-gradient-to-r from-blue-400 to-purple-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${getProgress(player)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-400">
                          {player.cpm || 0} CPM
                        </div>
                        <div className="text-xs text-gray-400">
                          {player.accuracy || 100}% acc
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="text-center text-gray-400 py-4">
                    Waiting for racers to join...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
