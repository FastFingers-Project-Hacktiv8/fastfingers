import { useNavigate } from "react-router";
import { useSocket } from "../contexts/Context";

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/auth");
  };
  const { socketConnected, gameStatus } = useSocket();
  return (
    <>
      <div className="bg-black/90 shadow-lg p-1 text-center borde flex justify-between">
        <div className="flex">
          <div className="mt-2 flex items-center justify-center space-x-4 flex-col ml-4">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  socketConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span
                className={`text-sm ${
                  socketConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                {socketConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="text-sm text-white">
              Status: <span className="font-medium">{gameStatus}</span>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2  ">
            🚗 FastFingers Typing Race
          </h1>
          <p className="text-white mb-4">
            Race against others in real-time typing challenges!
          </p>
        </div>

        <div className="flex justify-center items-center mr-2">
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 rounded-lg text-red-500 hover:text-white hover:bg-red-500 transition-colors duration-200 font-bold"
          >
            <i className="fa-solid fa-right-from-bracket mr-3 w-5"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
