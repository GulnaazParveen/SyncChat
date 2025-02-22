import React from "react";

const Register = ({ setIsLogin, setRegister, register, userRegister }) => {
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRegister({ ...register, avatar: file });
    }
  };

  return (
    <div className="w-1/2 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">
        Register for ChatConnect
      </h2>
      <input
        type="text"
        className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600 mb-4"
        placeholder="Enter your name..."
        value={register.name}
        onChange={(e) => setRegister({ ...register, name: e.target.value })}
      />
      <input
        type="email"
        className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600 mb-4"
        placeholder="Enter your email..."
        value={register.email}
        onChange={(e) => setRegister({ ...register, email: e.target.value })}
      />
      <input
        type="password"
        className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600 mb-4"
        placeholder="Enter your password..."
        value={register.password}
        onChange={(e) => setRegister({ ...register, password: e.target.value })}
      />
      {/* Avatar Upload */}
      <input
        type="file"
        accept="image/*"
        className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600 mb-4"
        onChange={handleAvatarChange}
      />
      <button
        onClick={userRegister}
        className="bg-green-500 px-4 py-2 rounded-lg text-white shadow-md w-full"
      >
        Register
      </button>
      <p
        className="text-white mt-2 cursor-pointer"
        onClick={() => setIsLogin(true)}
      >
        Already have an account? Login
      </p>
    </div>
  );
};

export default Register;
