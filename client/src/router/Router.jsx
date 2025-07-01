import { createBrowserRouter, redirect } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";
import AuthPage from "../pages/AuthPage";

Home;
const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },

  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
]);

export default router;
