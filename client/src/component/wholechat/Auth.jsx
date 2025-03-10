import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";

const Auth = ({ setUser }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg w-[30rem] flex flex-col items-center justify-center text-center">
      <Routes>
        <Route path="register" element={<Register setUser={setUser} />} />
        <Route path="login" element={<Login setUser={setUser} />} />
        {/* Always redirect to register, but ensure wrapper loads first */}
        <Route path="*" element={<Register setUser={setUser} />} />
      </Routes>
    </div>
  );
};

export default Auth;
