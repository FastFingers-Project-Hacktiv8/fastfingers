import { useNavigate } from "react-router";
import { useSocket } from "../contexts/Context";
import { User, LogOut, Wifi, WifiOff } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { socketConnected, gameStatus, username } = useSocket();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/auth");
  };

  return (
    <header className="bg-black text-white shadow-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        {/* Left: User Info & Status */}
        <div className="flex flex-col sm:items-start items-center gap-2">
          {username && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white to-blue-400 flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-black" />
              </div>
              <span className="font-semibold">{username}</span>
            </div>
          )}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
            <span
              className={`px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5 ${
                socketConnected
                  ? "bg-green-600/20 text-green-400 border border-green-500/40"
                  : "bg-red-600/20 text-red-400 border border-red-500/40"
              }`}
            >
              {socketConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {socketConnected ? "Connected" : "Disconnected"}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10 font-medium">
              Status: <span className="text-white">{gameStatus}</span>
            </span>
          </div>
        </div>

        {/* Center: Logo & Subtitle */}
        <div className="text-center mr-24">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent tracking-wide drop-shadow-sm">
            FastFingers
          </h1>
          <p className="text-xs text-gray-500">Real-time Typing Race</p>
        </div>

        {/* Right: Logout */}
        <div className="flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
