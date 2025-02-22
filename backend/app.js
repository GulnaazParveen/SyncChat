import express from "express"
const app=express();
dotenv.config(); 
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
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