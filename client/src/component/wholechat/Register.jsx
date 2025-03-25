import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utility/axiosInstance";

const Register = ({ setUser }) => {
  const [register, setRegister] = useState({
    name: "",
    email: "",
    password: "",
    avatar: null,
  });

  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRegister({ ...register, avatar: file });
    }
  };

  const userRegister = async () => {
    const formData = new FormData();
    formData.append("name", register.name);
    formData.append("email", register.email);
    formData.append("password", register.password);
    formData.append("avatar", register.avatar);

    try {
      const res = await axiosInstance.post("/users/registerUser", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setUser(res.data.data.user);
      alert("Registration successful! Please login.");
      navigate("/auth/login");
    } catch (error) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message;

      if (statusCode === 400) {
        alert(errorMessage || "Invalid input. Please check your details.");
      } else if (statusCode === 409) {
        alert("Email already registered! Redirecting to login...");
        navigate("/auth/login");
      } else if (statusCode === 415) {
        alert("Invalid avatar file. Please upload a valid image.");
      } else if (statusCode === 413) {
        alert("Avatar file is too large. Please upload a smaller image.");
      } else {
        alert("Registration failed. Please try again.");
      }
    }
  };

   return (
     <div className="flex items-center justify-center min-h-screen bg-gray-900">
       <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg w-[30rem] flex flex-col items-center justify-center text-center">
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
           onChange={(e) =>
             setRegister({ ...register, password: e.target.value })
           }
         />
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
           onClick={() => navigate("/auth/login")}
         >
           Already have an account? Login
         </p>
       </div>
     </div>
   );
};

export default Register;
