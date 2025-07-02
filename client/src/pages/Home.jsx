import { useSocket } from "../contexts/Context";
import GameStatusBar from "../homeComponents/GameStatusBar";
import RaceTrack from "../homeComponents/RaceTrack";
import CountdownDisplay from "../homeComponents/CountdownDisplay";
import GameStats from "../homeComponents/GameStats";
import TextDisplay from "../homeComponents/TextDisplay";
import TypingInput from "../homeComponents/TypingInput";
import GameControls from "../homeComponents/GameControls";
import GameResults from "../homeComponents/GameResults";
import PlayersList from "../homeComponents/PlayersList";

export default function Home() {
  const {
    gameStatus,
    userInput,
    setUserInput,
    text,
    timeRemaining,
    cpm,
    accuracy,
    errors,
    players,
    username,
    countdown,
    position,
    isComplete,
    startGame,
    socketConnected,
    connectionStatus,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Game Status Bar */}
        {gameStatus === "playing" && (
          <GameStatusBar
            players={players}
            connectionStatus={connectionStatus}
            timeRemaining={timeRemaining}
            formatTime={formatTime}
          />
        )}

        {/* Race Track with Cars */}
        {(gameStatus === "playing" || gameStatus === "finished") && (
          <RaceTrack
            players={players}
            username={username}
            getProgress={getProgress}
            gameStatus={gameStatus}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Typing Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Countdown */}
            {countdown !== null && countdown > 0 && (
              <CountdownDisplay countdown={countdown} />
            )}

            {/* Stats during game */}
            {gameStatus === "playing" && (
              <GameStats cpm={cpm} accuracy={accuracy} errors={errors} />
            )}

            {/* Text Display */}
            <TextDisplay
              text={text}
              userInput={userInput}
              gameStatus={gameStatus}
            />

            {/* Input Field */}
            <TypingInput
              gameStatus={gameStatus}
              userInput={userInput}
              setUserInput={setUserInput}
            />

            {/* Game Controls */}
            {(gameStatus === "waiting" || gameStatus === "finished") && (
              <GameControls
                gameStatus={gameStatus}
                timeLimit={timeLimit}
                setTimeLimit={setTimeLimit}
                startGame={startGame}
                socketConnected={socketConnected}
                loading={loading}
              />
            )}

            {/* Game Finished - Show Final Results */}
            {gameStatus === "finished" && (
              <GameResults
                isComplete={isComplete}
                position={position}
                cpm={cpm}
                accuracy={accuracy}
                errors={errors}
              />
            )}
          </div>

          {/* Right Side - Players & Leaderboard */}
          <div className="space-y-6">
            <PlayersList
              players={players}
              username={username}
              gameStatus={gameStatus}
              getProgress={getProgress}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
