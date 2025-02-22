import React from "react";

const Login = ({ setLogin, setIsLogin, login, userLogin }) => {
  return (
    <div className="w-1/2 text-center">
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
        onClick={() => setIsLogin(false)}
      >
        Don't have an account? Register
      </p>
    </div>
  );
};

export default Login;
