import { io } from "socket.io-client";

let socket;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io("http://localhost:8000", {
      auth: {
        token, // Pass the token during the handshake
      },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      socket.emit("userConnected", token); // Emit userConnected event with token
    });

    socket.on("tokenExpired", () => {
      console.log("❌ Token expired, please refresh the token.");
      // Handle token expiration (e.g., refresh token or logout)
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("reconnect", () => {
      console.log("✅ Socket reconnected");
      socket.emit("userConnected", token); // Re-emit userConnected event on reconnect
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
