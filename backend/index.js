import { app } from "./app.js";
import { dbconnect } from "./src/db/dbConnection.js";
import { createSocketServer } from "../socket/index.js";

dbconnect();

import http from "http";
const server = http.createServer(app);

createSocketServer(server);

server.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running at port no: ${process.env.PORT || 8000}`);
});
