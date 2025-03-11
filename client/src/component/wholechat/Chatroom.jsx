import React, { useEffect, useState, useRef } from "react";
import Mainchat from "../middle/Mainchat";
import Sidebar from "../leftside/Sidebar";
import Rightside from "../rightside/Rightside";
import axiosInstance from "../utility/axiosInstance";
import { connectSocket } from "../utility/connectSocket";

const Chatroom = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const socketRef = useRef(null); // ✅ Define socketRef before using it

 useEffect(() => {
   if (!user) return;

   const initializeSocket = async () => {
     socketRef.current = await connectSocket();
     if (!socketRef.current) return;

     console.log("🟢 Emitting userConnected event for:", user._id);
     socketRef.current.emit("userConnected", user._id);

     socketRef.current.on("updateOnlineUsers", (users) => {
       console.log("🟢 Online users updated:", users);
       setOnlineUsers(users);
     });

     socketRef.current.on("disconnect", () => {
       console.log("🔴 Socket disconnected.");
     });
   };

   initializeSocket();

   return () => {
     socketRef.current?.disconnect();
   };
 }, [user]);

  const getUsers = async () => {
    try {
      const response = await axiosInstance.get("/users/getusers", {
        withCredentials: true,
      });
      console.log("get users is ", response.data.data);
      console.log("get users", response.data.data.user);
      
      if (response.data?.data?.length > 0) {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        const filteredFriends = response.data.data.filter(
          (user) => user._id !== loggedInUser._id
        );

        setFriends(filteredFriends);
      } else {
        console.log("⚠️ No users found.");
        setFriends([]); // Ensure it's an empty array
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setFriends([]);
    }
  };

  const getMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(
        `/conversations/getmessage/${selectedFriend._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const fetchedMessages = res.data?.data || [];
      const formattedMessages = fetchedMessages.map((msg) => ({
        sender: msg.sender?._id || msg.sender,
        message: msg.message,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (user) {
      getUsers();
    }
  }, [user]);

useEffect(() => {
  if (selectedFriend) {
    getMessages();
  }
}, [selectedFriend]);
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("receiveMessage", (data) => {
      if (selectedFriend && data.senderId === selectedFriend._id) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: data.senderId, message: data.message },
        ]);
      }
    });

    socketRef.current.on("tokenExpired", async () => {
      console.log("🔄 Token expired. Refreshing...");
      await handleTokenRefresh();
      const newSocket = await connectSocket(); // Ensure proper reconnection
      socketRef.current = newSocket; // Assign only after successful connection
    });

    return () => {
      socketRef.current?.off("receiveMessage");
      socketRef.current?.off("tokenExpired");
    };
  }, [selectedFriend]);

  const sendMessage = async () => {
    if (!selectedFriend || input.trim() === "") return;

    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "You", message: input },
      ]);

      socketRef.current.emit("sendMessage", {
        senderId: JSON.parse(localStorage.getItem("user"))._id,
        receiverId: selectedFriend._id,
        message: input,
      });

      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/conversations/sendmessage/${selectedFriend._id}`,
        { message: input },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
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
        <Rightside friends={friends} />
      </div>
    </div>
  );
};

export default Chatroom;
