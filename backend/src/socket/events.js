import { getIoInstance } from "./index.js";
const onlineUsers = new Map();
export const handleSocketEvents = (socket, io) => {
  // **User Connection Event**
  socket.on("userConnected", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected (Socket ID: ${socket.id})`);
    updateOnlineUsers(io);
  });

  // **User Disconnection Event**
  socket.on("disconnect", () => {
    let disconnectedUserId = null;

    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }

    console.log(` User disconnected: ${disconnectedUserId}`);
    updateOnlineUsers(io);
  });

  // **Message Handling**
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId,
        message,
      });
      console.log(`Message sent from ${senderId} to ${receiverId}`);
    } else {
      console.log(`Receiver ${receiverId} is offline.`);
    }
  });

  // **Update Online Users**
  const updateOnlineUsers = (io) => {
    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  };
};
