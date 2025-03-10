import { getIoInstance } from "../socket/index.js";
const onlineUsers = new Map();

export const handleSocketEvents = (socket) => {
  console.log(`✅ Handling events for: ${socket.id}`);

  // **User Connection Event**
  socket.on("userConnected", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} is online (Socket ID: ${socket.id})`);
    updateOnlineUsers();
  });

  // **Message Handling**
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      getIoInstance().to(receiverSocketId).emit("receiveMessage", {
        senderId,
        message,
      });
      console.log(`📩 Message sent from ${senderId} to ${receiverId}`);
    } else {
      console.log(`⚠️ Receiver ${receiverId} is offline.`);
    }
  });

  // **User Disconnection**
  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log(`🔴 User disconnected: ${socket.id}`);
    updateOnlineUsers();
  });

  // **Update Online Users List**
  const updateOnlineUsers = () => {
    getIoInstance().emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  };
};
