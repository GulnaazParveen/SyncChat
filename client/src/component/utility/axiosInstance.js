import axios from "axios";
const getToken = () => {
  return localStorage.getItem("accessToken");
};

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // Allow cookies for auth
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    let accessToken = getToken()
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If JWT expired, try refreshing
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          "http://localhost:8000/api/v1/users/refresh-token",
          {},
          { withCredentials: true }
        );

        localStorage.setItem("accessToken", data.accessToken);
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;

        return axiosInstance(originalRequest); // Retry failed request
      } catch (refreshError) {
        console.error("Refresh token expired, redirecting to login.");
        localStorage.clear();
        window.location.href = "/login"; // Redirect to login page
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
