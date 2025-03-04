import express from "express"
const app=express();
dotenv.config(); 
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});
// CORS Middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Preflight requests handle करें
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});


app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser())

import userRouter from "./src/routes/user.routes.js";
import messagesRouter from "./src/routes/messages.route.js";

app.use("/api/v1/users",userRouter)
app.use("/api/v1/conversations",messagesRouter)

export {app};