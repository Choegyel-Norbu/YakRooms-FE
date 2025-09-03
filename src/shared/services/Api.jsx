import axios from "axios";
import { getStorageItem } from "@/shared/utils/safariLocalStorage";

const api = axios.create({
  // baseURL: "http://localhost:8080/api",
  // baseURL: "https://0d123863c798.ngrok-free.app",
  baseURL: "https://yakrooms-be-production.up.railway.app/api",
  withCredentials: false, // Important for cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for token with Safari-specific handling
api.interceptors.request.use(
  (config) => {
    try {
      const token = getStorageItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to get token from storage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
