import React, { useEffect, useState } from "react";
import Mainchat from "../middle/Mainchat";
import Sidebar from "../leftside/Sidebar";
import Rightside from "../rightside/Rightside";
import axios from "axios";

const Chatroom = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    getUsers();
  }, []);

  // Fetch Users
  const getUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/users/getusers",
        { withCredentials: true }
      );
      console.log("Fetched Users:", response.data.data);

      setFriends(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch Messages for the selected friend
  useEffect(() => {
    if (selectedFriend) {
      getMessages();
    }
  }, [selectedFriend]);

  const getMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/conversations/getmessage/${selectedFriend._id}`,
        { withCredentials: true }
      );

      console.log("Full API Response:", res.data); 
      const fetchedMessages = res.data?.data || [];
      console.log("Messages received:", fetchedMessages);

      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]); 
    }
  };


  // Send Message
  const sendMessage = async () => {
    if (!selectedFriend || input.trim() === "") return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/conversations/sendmessage/${selectedFriend._id}`,
        { message: input },
        { withCredentials: true }
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
