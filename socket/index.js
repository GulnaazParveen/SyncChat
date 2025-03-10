import dotenv from "dotenv";
dotenv.config();

console.log("🔍 JWT_SECRET is:", process.env.JWT_SECRET); // Add this line

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { handleSocketEvents } from "./events.js"; // Import event handlers

let io; // Global Socket.io instance

export const createSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"], // Frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // Enable WebSocket
  });

  // **Middleware for Authentication**
  io.use((socket, next) => {
    console.log("🔍 Authenticating Socket Connection...");

    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log("❌ No token found in handshake.auth!");
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`✅ Token verified for user: ${decoded.id}`);
      socket.user = decoded; // Attach user data to socket
      next();
    } catch (err) {
      console.log("🔴 Token verification failed:", err.message);

      if (err.name === "TokenExpiredError") {
        console.log("🔄 Token expired, prompting client to refresh...");
        socket.emit("tokenExpired"); // Notify client
      }

      return next(new Error("Unauthorized"));
    }
  });

  // **Socket Connection Handler**
  io.on("connection", (socket) => {
    console.log(
      `🟢 User connected: ${socket.user.id} (Socket ID: ${socket.id})`
    );

    handleSocketEvents(socket, io); // Pass socket & io to events.js

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.user.id}`);
    });
  });
};

// **Function to Get Global io Instance**
export const getIoInstance = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};
