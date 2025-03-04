import React, { useEffect, useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Chatroom from "./Chatroom";
import axiosInstance from "../utility/axiosInstance";
const Auth = ({ setUser }) => {
  const [isChatRoom, setChatRoom] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [register, setRegister] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "",
  });

   useEffect(() => {
     const userData = JSON.parse(localStorage.getItem("user"));
     if (userData) {
       setUser(userData);
       setChatRoom(true); 
     }
   }, []);
  // Register User
 const userRegister = async () => {
   const formData = new FormData();
   formData.append("name", register.name);
   formData.append("email", register.email);
   formData.append("password", register.password);
   formData.append("avatar", register.avatar); 

   try {
     const response = await axiosInstance.post(
       "/users/registerUser",
       formData,
       {
         headers: {
           "Content-Type": "multipart/form-data",
         },
         withCredentials: true,
       }
     );
      setIsLogin(true);
      alert("registration is successfully")
   } catch (error) {
     console.error("Registration failed:", error);
        alert("registration failed");
   }
 };

  // Login User
  const userLogin = async () => {
    try {
      const res = await axiosInstance.post(
        "/users/login",
        login,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setUser(res.data.user);
      const token = res.data.data.accessToken;
      const user = res.data.data.user;
      // console.log("token",token);
      // console.log("user",user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setChatRoom(true); 
    } catch (error) {
      console.error("Login failed:", error.response?.data || error);
      alert("Invalid email or password.");
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg w-[30rem] flex flex-col items-center justify-center text-center">
      {isChatRoom ? (
        <Chatroom />
      ) : isLogin ? (
        <Login
          setIsLogin={setIsLogin}
          setLogin={setLogin}
          login={login}
          userLogin={userLogin}
        />
      ) : (
        <Register
          setIsLogin={setIsLogin}
          setRegister={setRegister}
          register={register}
          userRegister={userRegister}
        />
      )}
    </div>
  );
};

export default Auth;
