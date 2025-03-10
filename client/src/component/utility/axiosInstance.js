import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const handleTokenRefresh = async () => {
  try {
    const res = await axios.post(
      "http://localhost:8000/api/v1/users/refreshtoken",
      {
        token: localStorage.getItem("refreshToken"),
      }
    );

    const newToken = res.data?.data?.accessToken;
    console.log("✅ Token refreshed successfully:", newToken);

    if (newToken) {
      localStorage.setItem("token", newToken);
      return newToken;
    } else {
      throw new Error("New token not received.");
    }
  } catch (error) {
    console.error("🔴 Token refresh failed:", error);
    handleLogout();
  }
};

export const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/auth/login";
};

export default axiosInstance;
