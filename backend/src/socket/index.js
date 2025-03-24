import dotenv from "dotenv";
dotenv.config();

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { handleSocketEvents } from "./events.js";

let io;

export const createSocketServer = (server) => {
  io = new Server(server, {
    cors: {
       origin: process.env.CORS_ORIGIN, // Frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // **Middleware for Authentication**
  io.use((socket, next) => {
    console.log("Authenticating Socket Connection...");

    const token = socket.handshake.auth?.token;
    console.log("Token received in handshake:", token);

    if (!token) {
      console.log(" No token found in handshake.auth!");
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      if (!decoded._id) {
        throw new Error("Invalid token payload, missing _id");
      }

      socket.user = decoded; // Attach user data to socket
      next();
    } catch (err) {
      console.log("Token verification failed:", err.message);

      if (err.name === "TokenExpiredError") {
        console.log("Token expired, prompting client to refresh...");
        socket.emit("tokenExpired");
      }

      return next(new Error("Unauthorized"));
    }
  });

  // **Socket Connection Handler**
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.user);
    handleSocketEvents(socket, io);
  });
};

export const getIoInstance = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};
