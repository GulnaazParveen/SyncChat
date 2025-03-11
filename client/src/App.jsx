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
      let storedUser = localStorage.getItem("user");

      console.log("🔍 Checking token:", token); // 👀 Debug

      if (token) {
        console.log("🔄 Fetching user data...");
        await fetchUserData(token);
      } else {
        console.log("❌ No token found, showing login page.");
        setLoading(false); // If no token, stop loading and show login
      }
    };

    initializeUser();
  }, []);


  const fetchUserData = async (token) => {
    console.log("🚀 fetchUserData called with token:", token); // 👀 Debug
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ API Response:", res.data);

      console.log("✅ User fetched:", res.data.data.user);

      setUser(res.data.data.user); // ✅ User state update karo
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      await connectSocket(); // ✅ Socket tabhi connect ho jab user logged in ho
    } catch (error) {
      console.log("🔴 Token invalid. Trying refresh...");

      const newToken = await handleTokenRefresh();
      if (newToken) {
        localStorage.setItem("token", newToken);
        return fetchUserData(newToken); // ✅ New token ke saath dobara fetchUserData call karo
      } else {
        console.log("🔴 Refresh token failed. Logging out...");
        handleLogout();
      }
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

  // Prevent infinite looping
  if (!user && !["/auth/login", "/auth/register"].includes(location.pathname)) {
    return <Navigate to="/auth/login" replace />;
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
        element={<Navigate to={user ? "/chatroom" : "/auth/login"} replace />}
      />
    </Routes>
  );
};

export default App;
