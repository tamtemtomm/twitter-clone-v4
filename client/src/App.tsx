// Import dependencies
import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Import Components
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login/Login";
import Signup from "./pages/Auth/Signup/Signup";
import Notification from "./pages/Notification/Notification";
import Navbar from "./components/Navbar/Navbar";
import Explore from "./components/Explore/Explore";
import Profile from "./pages/Profile/Profile";
import LoadingSpinner from "./components/Common/LoadingSpinner";

function App() {
  // Set authUser state to protect auth route using useQuery
  const {
    data: authUser,
    isLoading,
    // isError,
    // error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try { 
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.error || data === 401 || !res.ok) {
          return null
        }

        // console.log(data);
        // console.log("authUser is here", data);

        return data;
      } catch (err: unknown) {
        console.log(err);
        throw err;
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="flex max-auto">
        {authUser && <Navbar />}
        <Routes>
          <Route
            path="/"
            element={authUser ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!authUser ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <Signup /> : <Navigate to="/" />}
          />
          <Route
            path="/notifications"
            element={authUser ? <Notification /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile/:username"
            element={authUser ? <Profile /> : <Navigate to="/login" />}
          />
        </Routes>
        {authUser && <Explore />}
        <Toaster />
      </div>
    </>
  );
}

export default App;
