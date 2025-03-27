import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`, // Backend URL
  withCredentials: true, // Ensure cookies are sent
});

// REQUEST INTERCEPTOR: Har request ke sath access token bhejna
axiosInstance.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log("🔴 No token found. Attempting refresh...");
    handleTokenRefresh().then((newToken) => {
      if (newToken) {
        req.headers.Authorization = `Bearer ${newToken}`;
      }
    });
  }
  return req;
});

// RESPONSE INTERCEPTOR: Expired token ko refresh karna
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

// TOKEN REFRESH FUNCTION
export const handleTokenRefresh = async () => {
  try {
    console.log("🔄 Attempting token refresh...");

    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/refreshtoken`,
      {},
      { withCredentials: true }
    );

    console.log("🔵 Refresh token response:", res.data);

    const newToken = res.data?.data?.accessToken;
    if (newToken) {
      console.log("✅ Token refreshed successfully:", newToken);

      // ✅ Update accessToken in localStorage
      localStorage.setItem("token", newToken);

      return newToken;
    } else {
      console.error("⚠️ No accessToken in response, logging out...");
      return null;
    }
  } catch (error) {
    console.error("Token refresh failed:", error.response?.data || error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("🔴 Refresh token invalid or expired. Logging out...");
    }
    return null;
  }
};

// LOGOUT FUNCTION
export const handleLogout = async () => {
  console.log("🔴 handleLogout CALLED! Deleting Token...");

  try {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/logout`,
      {},
      { withCredentials: true }
    );
  } catch (error) {
    console.error("Logout API failed:", error);
  }

  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/auth/login";
};

export default axiosInstance;
