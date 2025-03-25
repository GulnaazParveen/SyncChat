import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import userRouter from "./src/routes/user.routes.js";
import messagesRouter from "./src/routes/messages.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/conversations", messagesRouter);

export { app };
