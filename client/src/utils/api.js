import axios from "axios";
import { DOMAIN } from "./config";

const api = axios.create({
  baseURL: `${DOMAIN}/api`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post("/auth/refresh");
        localStorage.setItem("accessToken", data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error("Refresh token invalid or expired", err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
