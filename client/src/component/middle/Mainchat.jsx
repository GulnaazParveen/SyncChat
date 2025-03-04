import React, { useEffect, useState } from "react";

const Mainchat = ({
  selectedFriend,
  messages,
  input,
  setInput,
  sendMessage,
}) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch the logged-in user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser._id) {
      setCurrentUser(storedUser);
    }
  }, []);

  return (
    <>
      <main className="flex-1 bg-white/40 p-6 rounded-xl shadow-md backdrop-blur-lg">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">
            Chat with {selectedFriend?.name || "Friend"}
          </h1>
        </header>

        {/* Messages Display */}
        <div className="h-64 overflow-y-auto p-4 bg-white/20 rounded-lg mb-4 space-y-2">
          {messages.map((msg, index) => {
             const isMe = msg.sender === currentUser?._id; 
            return (
              <div
                key={index}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-lg max-w-xs ${
                    isMe
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-200 text-gray-900 self-start"
                  }`}
                >
                  <strong>{isMe ? "Me" : selectedFriend?.name}: </strong>
                  {msg.message} 
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 px-4 py-2 rounded-lg text-white shadow-md"
          >
            Send
          </button>
        </div>
      </main>
    </>
  );
};

export default Mainchat;
