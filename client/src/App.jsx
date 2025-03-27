import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import axiosInstance, {
  handleTokenRefresh,
  handleLogout,
} from "./component/utility/axiosInstance";
import Chatroom from "./component/wholechat/Chatroom";
import Login from "./component/wholechat/Login";
import Register from "./component/wholechat/Register";
import { connectSocket } from "./component/utility/connectSocket";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      let token = localStorage.getItem("token");
      let refreshToken = localStorage.getItem("refreshToken");

      if (!token && !refreshToken) {
        console.log("🔴 No tokens found. Redirecting to register.");
        setLoading(false);
        return;
      }

      if (!token) {
        token = await handleTokenRefresh();
        if (token) {
          localStorage.setItem("token", token);
        } else {
          console.log("🔴 Refresh token expired. Logging out.");
          handleLogout();
          setLoading(false);
          return;
        }
      }

      await fetchUserData(token);
    };

    initializeUser();
  }, []);

  const fetchUserData = async (token) => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
     const res = await axiosInstance.get("/users/me", {
       withCredentials: true,
       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
     });


      setUser({ ...res.data.data.user, token });
      localStorage.setItem(
        "user",
        JSON.stringify({ ...res.data.data.user, token })
      );
      await connectSocket(token);
    } catch (error) {
      console.log("🔴 Token invalid. Logging out.");
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-xl text-white">Loading...</div>
    );

  return (
    <Router>
      <AppRoutes user={user} setUser={setUser} />
    </Router>
  );
};

const AppRoutes = ({ user, setUser }) => {
  const location = useLocation();

  if (
    !user &&
    location.pathname !== "/auth/register" &&
    location.pathname !== "/auth/login"
  ) {
    return <Navigate to="/auth/register" replace />;
  }

  return (
    <Routes>
      <Route path="/auth/register" element={<Register setUser={setUser} />} />
      <Route path="/auth/login" element={<Login setUser={setUser} />} />
      <Route
        path="/chatroom"
        element={
          user ? <Chatroom user={user} /> : <Navigate to="/auth/login" />
        }
      />
      <Route
        path="/"
        element={
          <Navigate to={user ? "/chatroom" : "/auth/register"} replace />
        }
      />
    </Routes>
  );
};

export default App;
