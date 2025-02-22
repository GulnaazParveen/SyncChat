import { app } from "./app.js";
import { dbconnect } from "./src/db/dbConnection.js";

dbconnect();

app.listen(process.env.PORT || 8000, () => {
  console.log(`server is running at port no : ${process.env.PORT}`);
});