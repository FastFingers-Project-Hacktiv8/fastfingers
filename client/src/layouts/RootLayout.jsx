import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import { SocketProvider } from "../contexts/Context.jsx";
const RootLayout = () => {
  return (
    <>
      <SocketProvider>
        <Navbar />
        <Outlet />
      </SocketProvider>
    </>
  );
};

export default RootLayout;
