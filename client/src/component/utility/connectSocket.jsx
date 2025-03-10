import { io } from "socket.io-client";

export const connectSocket = async () => {
  let token = localStorage.getItem("token");

  if (!token) {
    console.log("🔴 No token found, attempting refresh...");
    await refreshAccessToken(); // Ensure token is refreshed
    token = localStorage.getItem("token"); // Retrieve new token
    if (!token) return null; // If still no token, return
  }

  let socket = io("http://localhost:8000", {
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => console.log("🟢 Socket connected:", socket.id));

  socket.on("tokenExpired", async () => {
    console.log("🔄 Token expired! Refreshing...");
    await refreshAccessToken();
    const newToken = localStorage.getItem("token");

    if (newToken) {
      console.log("✅ New token received, reconnecting socket...");
      socket.disconnect();
      socket = io("http://localhost:8000", {
        auth: { token: newToken },
      });
    } else {
      console.log("🔴 Refresh token expired. Logging out...");
      handleLogout();
    }
  });

  return socket;
};
