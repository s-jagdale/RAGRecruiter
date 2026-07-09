import axios from "axios";
import { AUTH_TOKEN_KEY } from "../constants";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize FastAPI's {detail: "..."} error shape into a plain message
    // so every call site can just read error.message.
    const detail = error?.response?.data?.detail;
    if (detail) {
      error.message = typeof detail === "string" ? detail : JSON.stringify(detail);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
