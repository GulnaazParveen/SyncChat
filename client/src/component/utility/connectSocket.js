import { io } from "socket.io-client";

let socket;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: {
        token, // Pass the token during the handshake
      },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected");
      socket.emit("userConnected", token); // Emit userConnected event with token
    });

    socket.on("tokenExpired", async() => {
      console.log("Token expired, please refresh the token.");
      // Handle token expiration (e.g., refresh token or logout)
       const newToken = await handleTokenRefresh();
  
  if (newToken) {
    console.log("✅ New token obtained, reconnecting socket...");
    socket.auth.token = newToken;
    socket.disconnect(); // Ensure old connection is closed
    socket.connect(); // Establish new connection with fresh token
  } else {
    console.log("Failed to refresh token. Logging out...");
    handleLogout();
  }
    });

    socket.on("disconnect", () => {
      console.log(" Socket disconnected");
    });

    socket.on("reconnect", () => {
      console.log("Socket reconnected");
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
