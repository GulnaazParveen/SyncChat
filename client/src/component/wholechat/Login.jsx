import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utility/axiosInstance";

const Login = ({ setUser }) => {
  const [login, setLogin] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const userLogin = async () => {
    try {
      const res = await axiosInstance.post("/users/login", login, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const { accessToken, user } = res.data.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      navigate("/chatroom");
    } catch (error) {
      const status = error.response?.status;

      if (status === 404) {
        alert("User not found! Redirecting to Register...");
        navigate("/auth/register");
      } else if (status === 401 || status === 400) {
        alert("Invalid email or password.");
      } else {
        alert("Something went wrong. Please try again later.");
      }
    }

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg w-[30rem] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Welcome to ChatConnect
        </h2>
        <input
          type="email"
          className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600 mb-4"
          placeholder="Enter your email..."
          value={login.email}
          onChange={(e) => setLogin({ ...login, email: e.target.value })}
        />
        <input
          type="password"
          className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600 mb-4"
          placeholder="Enter your password..."
          value={login.password}
          onChange={(e) => setLogin({ ...login, password: e.target.value })}
        />
        <button
          onClick={userLogin}
          className="bg-blue-500 px-4 py-2 rounded-lg text-white shadow-md w-full"
        >
          Login
        </button>
        <p
          className="text-white mt-2 cursor-pointer"
          onClick={() => navigate("/auth/register")}
        >
          Don't have an account? Register
        </p>
      </div>
    </div>
  );
};

export default Login;
