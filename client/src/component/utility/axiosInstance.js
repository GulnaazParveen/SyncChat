import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // ✅ Ensure cookies are sent
});

// ✅ REQUEST INTERCEPTOR: Har request ke sath access token bhejna
axiosInstance.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ✅ RESPONSE INTERCEPTOR: Expired token ko refresh karna
axiosInstance.interceptors.response.use(
  (response) => response, // Agar response thik hai to return kar do
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log("🔄 Token expired, attempting refresh...");

      const newToken = await handleTokenRefresh();

      if (newToken) {
        console.log("✅ Retrying failed request with new token...");
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(error.config); // Request ko retry karo
      } else {
        console.error("❌ Refresh token failed, logging out...");
        handleLogout();
      }
    }
    return Promise.reject(error);
  }
);

// ✅ TOKEN REFRESH FUNCTION
export const handleTokenRefresh = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.log("⚠️ No refresh token found, logging out...");
      handleLogout();
      return null;
    }

    console.log("🔄 Attempting token refresh with:", refreshToken);

    const res = await axios.post(
      "http://localhost:8000/api/v1/users/refreshtoken",
      { token: refreshToken },
      { withCredentials: true }
    );

    console.log("🔵 Refresh token response:", res.data);

    const newToken = res.data?.data?.accessToken;
    if (newToken) {
      console.log("✅ Token refreshed successfully:", newToken);

      // Update tokens in localStorage
      localStorage.setItem("token", newToken);

      return newToken;
    } else {
      console.error("⚠️ No accessToken in response, logging out...");
      handleLogout();
      return null;
    }
  } catch (error) {
    console.error("❌ Token refresh failed:", error.response?.data || error);
    handleLogout();
    return null;
  }
};

// ✅ LOGOUT FUNCTION
export const handleLogout = () => {
   console.log("🔴 handleLogout CALLED! Deleting Token...");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/auth/login";
};

export default axiosInstance;
