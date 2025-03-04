const onlineUsers = {}; // Store online users

export const handleSocketEvents = (socket, io) => {
  console.log(
    "🔹 User connected:",
    socket.userId,
    "(Socket ID:",
    socket.id,
    ")"
  );

  //  Listen for "userConnected" event from frontend
  socket.on("userConnected", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("updateOnlineUsers", Object.keys(onlineUsers));
  });

  // Listen for "sendMessage" event
  socket.on("sendMessage", ({ receiverId, message }) => {
    console.log(` Message from ${socket.userId} to ${receiverId}:`, message);

    const receiverSocketId = onlineUsers[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId: socket.userId,
        message,
      });
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.userId);
    delete onlineUsers[socket.userId];
    io.emit("updateOnlineUsers", Object.keys(onlineUsers));
  });
};
