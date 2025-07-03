import { Trophy, Car, Zap } from "lucide-react";

export default function RaceTrack({ players, username, getProgress }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">Race Progress</h2>
        </div>
      </div>
      <div className="space-y-4">
        {players.slice(0, 5).map((player, index) => (
          <div key={player.username} className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-100 border border-blue-200">
                  <Car className="h-4 w-4 text-blue-600" />
                </div>
                <span
                  className={`font-semibold ${
                    player.username === username
                      ? "text-blue-600"
                      : "text-gray-900"
                  }`}
                >
                  {player.username}{" "}
                  {player.username === username && (
                    <span className="text-xs text-blue-500">(You)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Zap className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700 font-medium">
                  {player.cpm || 0} CPM
                </span>
              </div>
            </div>
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${getProgress(player)}%` }}
              >
                <div className="h-full bg-white/30"></div>
              </div>
              <div
                className="absolute top-0.5 transition-all duration-500"
                style={{
                  left: `${Math.max(getProgress(player) - 1, 0)}%`,
                }}
              >
                <Car className="h-2 w-2 text-gray-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
