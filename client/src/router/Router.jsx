import { createBrowserRouter, redirect } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";
import AuthPage from "../pages/AuthPage";

Home;
const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
    loader: () => {
      if (localStorage.getItem("access_token")) {
        return redirect("/");
      }
      return null;
    },
  },

  {
    
    path: "/",
    element: <RootLayout />,
    loader: () => {
      if (!localStorage.getItem("access_token")) {
        return redirect("/auth");
      }
      return null;
    },
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
]);

export default router;
