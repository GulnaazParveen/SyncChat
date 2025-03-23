import { io } from "socket.io-client";
import { handleTokenRefresh, handleLogout } from "./axiosInstance";
export const connectSocket = async () => {
  let token = localStorage.getItem("token");

  if (!token) {
    console.log("🔴 No token found, attempting refresh...");
    await handleTokenRefresh();
    token = localStorage.getItem("token");
    if (!token) return null;
  }

  let socket = io("http://localhost:8000", {
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => console.log("🟢 Socket connected:", socket.id));

  socket.on("tokenExpired", async () => {
    console.log("🔄 Token expired! Refreshing...");
    const newToken = await handleTokenRefresh();

    if (newToken) {
      console.log("✅ New token received, reconnecting socket...");
      socket.disconnect();
      socket = io("http://localhost:8000", {
        transports: ["websocket"],
        auth: { token: newToken },
      });
    } else {
      console.log("🔴 Refresh token expired. Logging out...");
      handleLogout();
    }
  });

  return socket;
};
