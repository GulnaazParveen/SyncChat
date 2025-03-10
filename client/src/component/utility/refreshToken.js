import axiosInstance from "./axiosInstance";
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const res = await axiosInstance.post("/users/refreshtoken", {
      refreshToken,
    });

    const newToken = res.data.data.accessToken;
    localStorage.setItem("token", newToken);

    return newToken;
  } catch (err) {
    console.log("Session expired. Redirecting to login.");
    localStorage.clear();
      window.location.href = "/";
  }
};
