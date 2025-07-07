import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  // baseURL: "https://2076-119-2-125-165.ngrok-free.app",
  // baseURL: "https://sdp-platform-production.up.railway.app/api",
  withCredentials: true, // Important for cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
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
