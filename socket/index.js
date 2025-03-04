import { Server } from "socket.io";
import jwt from "jsonwebtoken"; 
import { handleSocketEvents } from "./events.js";

let io;

export const createSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  //  Middleware for Authentication
 io.use((socket, next) => {
   console.log("🔍 Authenticating Socket Connection...");

   const token = socket.handshake.auth?.token;
   if (!token) {
     console.log("No token found!");
     return next(new Error("Unauthorized"));
   }

   try {
     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     socket.userId = decoded._id; 
     console.log(" Authentication Successful, UserID:", socket.userId);
     next();
   } catch (error) {
     console.log("Token Verification Failed:", error.message);
     return next(new Error("Token Expired"));
   }
 });

  io.on("connection", (socket) => {
    console.log(
      ` User connected: ${socket.userId} (Socket ID: ${socket.id})`
    );
    handleSocketEvents(socket, io);
  });

  console.log("Socket server initialized");
};

//  Function to get the Socket.io instance
export const getIoInstance = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
