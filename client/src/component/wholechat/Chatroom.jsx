import React, { useEffect, useState } from "react";
import Mainchat from "../middle/Mainchat";
import Sidebar from "../leftside/Sidebar";
import Rightside from "../rightside/Rightside";
import axiosInstance from "../utility/axiosInstance";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  auth: {
    token: localStorage.getItem("token"),
  },
  reconnection: true, // Auto-reconnect if connection drops
  reconnectionAttempts: 5, // Retry 5 times
  reconnectionDelay: 1000, // Wait 1 second before retrying
});

socket.on("connect", () => {
  console.log("Connected to WebSocket:", socket.id);
});
const Chatroom = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [onlineUsers, setOnlineUsers] = useState([]); // Track online users

useEffect(() => {
  getUsers();

  // Wait for the socket to connect before emitting
  socket.on("connect", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user._id) {
      socket.emit("userConnected", user._id);
    }
  });

  socket.on("disconnect", () => {
    console.log(" Socket disconnected from server");
  });

  socket.on("updateOnlineUsers", (users) => {
    setOnlineUsers(users);
  });

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("updateOnlineUsers");
  };
}, []);


const getUsers = async () => {
  try {
    const response = await axiosInstance.get("/users/getusers", {
      withCredentials: true,
    });

    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    // Filter out the logged-in user from friends list
    const filteredFriends = response.data.data.filter(
      (user) => user._id !== loggedInUser._id
    );

    setFriends(filteredFriends);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};


  // Fetch Messages when a friend is selected
  useEffect(() => {
    if (selectedFriend) {
      getMessages();
    }
  }, [selectedFriend]);

  const getMessages = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axiosInstance.get(
        `/conversations/getmessage/${selectedFriend._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      console.log("Full API Response:", res.data);
      const fetchedMessages = res.data?.data || [];

      // Normalize message format
      const formattedMessages = fetchedMessages.map((msg) => ({
        sender: msg.sender?._id || msg.sender,
        message: msg.message,
      }));

      console.log("Formatted Messages:", formattedMessages);
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  // Real-time message handling
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      console.log("New message received:", data);

      if (selectedFriend && data.senderId === selectedFriend._id) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: data.senderId, message: data.message },
        ]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedFriend]);

  // Send Message
  const sendMessage = async () => {
    if (!selectedFriend || input.trim() === "") return;

    try {
      // Instantly update the UI (Optimistic UI update)
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: "You", text: input },
      ]);

      // Emit the message via Socket.io for real-time delivery
      socket.emit("sendMessage", {
        senderId: JSON.parse(localStorage.getItem("user"))._id,
        receiverId: selectedFriend._id,
        message: input,
      });
      const token = localStorage.getItem("accessToken");

      const res = await axiosInstance.post(
        `/conversations/sendmessage/${selectedFriend._id}`,
        { message: input },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      console.log("Message Sent:", res.data);

      setMessages([...messages, { user: "You", text: input }]);
      setInput("");

      getMessages();
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
              Welcome SyncChat!⚡
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

        <Rightside friends={friends} />
      </div>
    </div>
  );
};

export default Chatroom;
