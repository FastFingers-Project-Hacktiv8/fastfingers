import {
  Users,
  Trophy,
  Crown,
  Medal,
  Award,
  Car,
  Zap,
  Target,
} from "lucide-react";

export default function PlayersList({
  players,
  username,
  gameStatus,
  getProgress,
}) {
  const getSortedPlayers = () => {
    if (gameStatus === "finished") {
      // Sort by completion status and CPM for final leaderboard
      return [...players].sort((a, b) => {
        if (a.finished && !b.finished) return -1;
        if (!a.finished && b.finished) return 1;
        return (b.cpm || 0) - (a.cpm || 0);
      });
    }
    return players;
  };

  const getPlayerIcon = (player, index) => {
    if (gameStatus === "finished") {
      // Show ranking icons only when game is finished
      if (index === 0) return <Crown className="h-4 w-4 text-amber-600" />;
      if (index === 1) return <Medal className="h-4 w-4 text-gray-600" />;
      if (index === 2) return <Award className="h-4 w-4 text-orange-600" />;
      return <Trophy className="h-4 w-4 text-green-600" />;
    }

    // During race, just show car icon
    return <Car className="h-4 w-4 text-blue-600" />;
  };

  const getPlayerBackground = (player, index) => {
    if (player.username === username) {
      return "bg-blue-50 border-blue-200 shadow-sm";
    }

    if (gameStatus === "finished") {
      if (index === 0) return "bg-amber-50 border-amber-200";
      if (index === 1) return "bg-gray-50 border-gray-300";
      if (index === 2) return "bg-orange-50 border-orange-200";
    }

    return "bg-gray-50 border-gray-200 hover:bg-gray-100";
  };

  const getIconBackground = (player, index) => {
    if (gameStatus === "finished") {
      if (index === 0) return "bg-amber-100 border-amber-300";
      if (index === 1) return "bg-gray-100 border-gray-300";
      if (index === 2) return "bg-orange-100 border-orange-300";
      return "bg-green-100 border-green-300";
    }

    return "bg-blue-100 border-blue-300";
  };

  const sortedPlayers = getSortedPlayers();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-center space-x-2 mb-6">
        <Users className="h-6 w-6 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-900">
          {gameStatus === "finished"
            ? "Final Leaderboard"
            : "Race Participants"}
        </h2>
      </div>
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.username}
            className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${getPlayerBackground(
              player,
              index
            )}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full border ${getIconBackground(
                    player,
                    index
                  )}`}
                >
                  {getPlayerIcon(player, index)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {gameStatus === "finished" && index < 3 && (
                        <span className="mr-2">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                        </span>
                      )}
                      {player.username}
                    </span>
                    {player.username === username && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  {gameStatus === "playing" && (
                    <div className="w-32 bg-gray-300 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-gray-700 to-gray-900 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgress(player)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-gray-600" />
                  <span className="font-bold text-gray-800">
                    {player.cpm || 0}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <Target className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">
                    {player.accuracy || 100}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Waiting for racers to join...</p>
          </div>
        )}
      </div>
    </div>
  );
}
