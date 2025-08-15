import axios from "axios";

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

// Add request interceptor for token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
