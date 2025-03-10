import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});
console.log("🔍 JWT_SECRET is:", process.env.JWT_SECRET); // Add this line

import { app } from "./app.js";
import { dbconnect } from "./src/db/dbConnection.js";
import { createSocketServer } from "../socket/index.js";
import http from "http";

dbconnect(); // ✅ Now database credentials are available

const server = http.createServer(app);
createSocketServer(server);

server.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running at port no: ${process.env.PORT || 8000}`);
});
