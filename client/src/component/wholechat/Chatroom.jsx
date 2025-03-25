import React, { useEffect, useState, useRef } from "react";
import Mainchat from "../middle/Mainchat";
import Sidebar from "../leftside/Sidebar";
import Rightside from "../rightside/Rightside";
import axiosInstance from "../utility/axiosInstance";
import { connectSocket, disconnectSocket } from "../utility/connectSocket";

const Chatroom = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const initializeSocket = async () => {
      console.log("🔍 Initializing socket with token:", user.token);
      socketRef.current = await connectSocket(user.token); // Pass the token
      if (!socketRef.current) return;

      socketRef.current.emit("userConnected", user._id);
      socketRef.current.on("updateOnlineUsers", (users) => {
        console.log("🟢 Online users updated:", users);
        setOnlineUsers(users);
      });
      socketRef.current.on("disconnect", () =>
        console.log("❌ Socket disconnected.")
      );
      socketRef.current.on("reconnect", () => {
        console.log("✅ Socket reconnected.");
        socketRef.current.emit("userConnected", user._id); // Re-emit userConnected event on reconnect
      });
      socketRef.current.on("receiveMessage", (data) => {
        console.log("📩 Message received:", data);
        setMessages((prev) => [
          ...prev,
          { sender: data.senderId, message: data.message },
        ]);
      });
    };

    initializeSocket();
    return () => disconnectSocket();
  }, [user]);

  const getUsers = async () => {
    try {
      const response = await axiosInstance.get("/users/getusers", {
        withCredentials: true,
      });
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      setFriends(
        response.data.data.filter((user) => user._id !== loggedInUser._id)
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getMessages = async () => {
    if (!selectedFriend) return;
    try {
      const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
      const res = await axiosInstance.get(
        `/conversations/getmessage/${selectedFriend._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setMessages(
        res.data?.data.map((msg) => ({
          sender: msg.sender?._id || msg.sender,
          message: msg.message,
        }))
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (user) getUsers();
  }, [user]);
  useEffect(() => {
    console.log("Selected friend changed:", selectedFriend);
    if (selectedFriend) getMessages();
  }, [selectedFriend]);

  const sendMessage = async () => {
    if (!selectedFriend || input.trim() === "") return;
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    setMessages((prev) => [
      ...prev,
      { sender: loggedInUser._id, message: input },
    ]);
    socketRef.current.emit("sendMessage", {
      senderId: loggedInUser._id,
      receiverId: selectedFriend._id,
      message: input,
    });
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/conversations/sendmessage/${selectedFriend._id}`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6">
      <div className="w-full max-w-6xl flex flex-col md:flex-row backdrop-blur-md bg-white/30 p-6 rounded-xl shadow-lg space-y-6 md:space-y-0 md:space-x-6">
        <Sidebar
          friends={friends}
          selectedFriend={selectedFriend}
          setSelectedFriend={setSelectedFriend}
          onlineUsers={onlineUsers}
        />
        {!selectedFriend ? (
          <div className="flex-1 flex flex-col justify-center items-center bg-white/40 p-6 rounded-xl shadow-md backdrop-blur-lg">
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome to SyncChat! ⚡
            </h2>
            <p className="text-gray-600 mt-1 text-center">
              Select a friend from the sidebar to start chatting.
            </p>
          </div>
        ) : (
          <Mainchat
            selectedFriend={selectedFriend}
            messages={messages}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
          />
        )}
        <Rightside
          friends={friends}
          selectedFriend={selectedFriend}
          sendMessage={sendMessage}
          onlineUsers={onlineUsers}
        />
      </div>
    </div>
  );
};

export default Chatroom;
