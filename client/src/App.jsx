import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
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

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        await connectSocket();
      } else {
        await fetchUserData(token);
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  const fetchUserData = async (token) => {
    if (!token) return;

    try {
      const res = await axiosInstance.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      await connectSocket(); // Ensure socket connects after fetching user
    } catch (error) {
      console.log("Token expired. Refreshing token...");
      await handleTokenRefresh();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/chatroom" />
            ) : (
              <Navigate to="/auth/register" />
            )
          }
        />
        <Route path="/auth/register" element={<Register setUser={setUser} />} />
        <Route path="/auth/login" element={<Login setUser={setUser} />} />
        <Route
          path="/chatroom"
          element={
            user ? <Chatroom user={user} /> : <Navigate to="/auth/login" />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
