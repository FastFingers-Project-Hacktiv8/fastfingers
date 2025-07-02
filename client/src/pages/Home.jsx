import { useSocket } from "../contexts/Context";

export default function Home() {
  const {
    // Socket state
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
    setUserInput,
    setTimeLimit,
  } = useSocket();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              🏁 Race Track
            </h3>
            {gameStatus === "playing" && (
              <div
                className={`px-4 py-2 rounded-full ${
                  timeRemaining <= 10
                    ? "bg-red-100 border border-red-300"
                    : timeRemaining <= 30
                    ? "bg-orange-100 border border-orange-300"
                    : "bg-purple-100 border border-purple-300"
                }`}
              >
                <span
                  className={`font-bold text-lg ${
                    timeRemaining <= 10
                      ? "text-red-700"
                      : timeRemaining <= 30
                      ? "text-orange-700"
                      : "text-purple-700"
                  }`}
                >
                  ⏰ {Math.floor(timeRemaining / 60)}:
                  {(timeRemaining % 60).toString().padStart(2, "0")}
                  {isSpectator && (
                    <span className="ml-2 text-xs opacity-75">
                      (Spectating)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="h-48 overflow-y-auto relative bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-gray-200">
            <div
              className="relative"
              style={{ height: `${players.length * 56}px` }}
            >
              {players.map((player, index) => {
                const isCurrentUser = player.username === username;
                const carEmoji = isCurrentUser ? "🚗" : "🚙";
                const trackPosition = Math.min(player.progress || 1, 95);

                return (
                  <div
                    key={player.username}
                    className="absolute transform -translate-y-1/2 transition-all duration-500 ease-out"
                    style={{
                      left: `${trackPosition}%`,
                      top: `${30 + index * 56}px`, // jarak antar car
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl">{carEmoji}</span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded line-clamp-[calc(var(--characters)/6)] ... ${
                          isCurrentUser
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {player.username.length > 5
                          ? player.username.slice(0, 5) + "..."
                          : player.username}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-3xl items-center">
                🏁
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-mono text-lg leading-relaxed p-4 bg-gray-50 rounded border overflow-hidden break-words whitespace-pre-wrap">
            {text.split("").map((char, index) => {
              let className = "text-gray-600"; // Default: untyped
              let displayChar = char;

              // Handle spaces - keep them as normal spaces but with background
              if (char === " ") {
                displayChar = " "; // Keep as normal space
                className += " bg-gray-100 border-b border-gray-300"; // Add subtle background to show spaces
              }

              if (index < userInput.length) {
                // Character has been typed
                if (userInput[index] === char) {
                  if (char === " ") {
                    className = "bg-green-200 border-b-2 border-green-400"; // Correct space
                  } else {
                    className = "bg-green-200 text-green-800"; // Correct character
                  }
                } else {
                  if (char === " ") {
                    className = "bg-red-200 border-b-2 border-red-400"; // Incorrect space
                  } else {
                    className = "bg-red-200 text-red-800"; // Incorrect character
                  }
                }
              } else if (index === currentIndex && gameStatus === "playing") {
                // Current position - where user should type next
                if (char === " ") {
                  className =
                    "bg-blue-200 border-b-2 border-blue-400 animate-pulse"; // Current space
                } else {
                  className = "bg-blue-200 text-blue-800 animate-pulse"; // Current character
                }
              }

              return (
                <span
                  key={index}
                  className={className}
                  style={{
                    minWidth: char === " " ? "0.5em" : "auto",
                    display: "inline-block",
                  }}
                >
                  {displayChar}
                </span>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isComplete || gameStatus !== "playing" || isSpectator}
            placeholder={
              isSpectator
                ? "You are watching as a spectator..."
                : gameStatus === "waiting"
                ? "Wait for the game to start..."
                : gameStatus === "playing"
                ? "Start typing here..."
                : "Game not active"
            }
            className="w-full p-3 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono"
            autoFocus={gameStatus === "playing" && !isSpectator}
          />
        </div>

        {gameStatus === "playing" && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
              📊 Real-time Performance
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{cpm}</div>
                <div className="text-sm text-blue-700 font-medium">CPM</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600">
                  {accuracy}%
                </div>
                <div className="text-sm text-green-700 font-medium">
                  Accuracy
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600">{errors}</div>
                <div className="text-sm text-red-700 font-medium">Errors</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white p-3 rounded shadow">
            <div className="text-2xl font-bold text-blue-600">{cpm}</div>
            <div className="text-sm text-gray-600">CPM</div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-2xl font-bold text-red-600">{errors}</div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
        </div>

        {gameStatus === "waiting" && !isSpectator && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              ⚙️ Game Settings
            </h3>
            <div className="flex items-center justify-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Time Limit:
              </label>
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
                <option value={180}>3 minutes</option>
                <option value={300}>5 minutes</option>
              </select>
            </div>
          </div>
        )}

        {gameStatus === "waiting" && !isSpectator && (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-gray-200">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏳</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Ready to Race?
              </h2>
              <p className="text-gray-600">
                Click the button below to generate AI text and start the typing
                race!
              </p>
            </div>
            <button
              onClick={startGame}
              disabled={!socketConnected || loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading AI Text...
                </span>
              ) : (
                "🚀 Start Game"
              )}
            </button>
          </div>
        )}

        {gameStatus === "waiting" && isSpectator && (
          <div className="bg-yellow-50 border-2 border-yellow-300 p-8 rounded-xl text-center shadow-lg">
            <div className="text-4xl mb-4">👀</div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">
              Spectator Mode
            </h2>
            <p className="text-yellow-700 mb-4">
              {spectatorMessage ||
                "You joined during an active game. Wait for the next round to participate!"}
            </p>
            <div className="bg-white rounded-lg p-4 text-sm text-gray-600">
              <p>
                📌 You can watch the current game and will be able to play when
                it finishes.
              </p>
            </div>
          </div>
        )}

        {gameStatus === "playing" && isSpectator && (
          <div className="bg-blue-50 border-2 border-blue-300 p-6 rounded-xl text-center shadow-lg">
            <div className="text-3xl mb-3">👀</div>
            <h2 className="text-xl font-bold text-blue-800 mb-2">
              Watching Live Game
            </h2>
            <p className="text-blue-700 mb-3">
              You're spectating this race! You can see all the action in
              real-time.
            </p>
            <div className="bg-white rounded-lg p-3 text-sm text-gray-600">
              <p>
                🎮 You'll be able to join the next round when this game ends.
              </p>
            </div>
          </div>
        )}

        {gameStatus === "playing" &&
          timeRemaining <= 10 &&
          timeRemaining > 0 && (
            <div className="bg-gradient-to-r from-red-400 to-orange-500 p-4 rounded-xl shadow-lg text-center text-white animate-pulse">
              <div className="text-3xl font-bold mb-1">⚠️ {timeRemaining}</div>
              <h2 className="text-lg font-semibold">Time running out!</h2>
            </div>
          )}

        {gameStatus === "playing" && timeRemaining === 0 && (
          <div className="bg-gradient-to-r from-red-500 to-red-700 p-6 rounded-xl shadow-lg text-center text-white">
            <div className="text-4xl font-bold mb-2">⏰</div>
            <h2 className="text-2xl font-bold">Time's Up!</h2>
            <p className="text-lg">The race has ended!</p>
          </div>
        )}

        {countdown !== null && countdown > 0 && (
          <div className="bg-gradient-to-r from-orange-400 to-red-500 p-8 rounded-xl shadow-lg text-center text-white">
            <div className="text-6xl font-bold animate-bounce mb-2">
              {countdown}
            </div>
            <h2 className="text-xl font-semibold">Get ready to type! 🏁</h2>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>👥</span>
              Players ({players.filter((p) => !p.isSpectator).length})
              {players.filter((p) => p.isSpectator).length > 0 && (
                <span className="text-sm text-gray-600">
                  + {players.filter((p) => p.isSpectator).length} spectator(s)
                </span>
              )}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {players.map((player, index) => (
              <div
                key={player.username}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                  player.username === username
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : player.isSpectator
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        player.isSpectator
                          ? "bg-yellow-500"
                          : player.finished
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    ></div>
                    {player.position > 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded mt-1 font-bold">
                        #{player.position}
                      </span>
                    )}
                  </div>
                  <div>
                    <span
                      className={`font-semibold ${
                        player.username === username
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {player.username}
                      {player.username === username && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                      {player.isSpectator && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                          👀 Spectator
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right text-sm">
                    {!player.isSpectator && (
                      <>
                        <div className="flex space-x-2 mb-1">
                          <span className="text-blue-600 font-semibold">
                            {player.cpm || 0} CPM
                          </span>
                          <span className="text-green-600 font-semibold">
                            {player.accuracy || 100}%
                          </span>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              player.finished
                                ? "bg-green-500"
                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                            }`}
                            style={{
                              width: `${Math.min(player.progress || 0, 100)}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                    {player.isSpectator && (
                      <div className="text-yellow-600 text-xs">Watching</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isComplete && (
          <div className="bg-gradient-to-br from-green-50 to-yellow-50 border-2 border-green-300 p-8 rounded-xl text-center shadow-lg">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-green-800 mb-2">
              Congratulations!
            </h2>
            <p className="text-xl text-green-700 mb-4">
              You finished at position{" "}
              <span className="font-bold text-yellow-600">#{position}</span>
            </p>
            <div className="bg-white rounded-lg p-4 inline-block shadow-md">
              <div className="text-center mb-2">
                <div className="text-lg font-bold text-purple-600">
                  🕒 Completed in {gameTime} seconds
                </div>
                <div className="text-sm text-green-600 mt-1">
                  ⏰ Time remaining: {timeRemaining} seconds
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{cpm}</div>
                  <div className="text-sm text-gray-600">CPM</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {accuracy}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {errors}
                  </div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                🚀 Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
