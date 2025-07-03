import { Users, Wifi, WifiOff, Timer } from "lucide-react";

export default function GameStatusBar({
  players,
  connectionStatus,
  timeRemaining,
  formatTime,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{players.length} Racing</span>
          </div>
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm ${
              connectionStatus === "connected"
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {connectionStatus === "connected" ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <span className="font-medium">
              {connectionStatus === "connected" ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xl font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
          <Timer className="h-6 w-6 text-gray-700" />
          <span>{formatTime(timeRemaining)}</span>
        </div>
      </div>
    </div>
  );
}
