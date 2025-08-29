// src/axios.js
import axios from "axios";

const instance = axios.create({
  // IMPORTANT: no trailing /api here
  baseURL: import.meta.env.VITE_API_URL || "https://backend-production-1f1a.up.railway.app",
  withCredentials: true,      // send/receive session cookies
  timeout: 10000,
});

// Request interceptor (nice-to-have logging/safety)
instance.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = config.headers["Content-Type"] || "application/json";
    if (config.url) config.url = config.url.replace(/([^:]\/)\/+/g, "$1"); // avoid double slashes
    if (import.meta.env.DEV) console.log(`→ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE: do NOT auto-redirect on 401 — let the route/UI decide (prevents loops)
instance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) console.log("←", response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.message;

    switch (status) {
      case 401:
        // surface to caller; no redirect here
        break;
      case 403:
        console.error("Access forbidden:", message);
        break;
      case 404:
        console.error("Resource not found:", error.config?.url);
        break;
      case 500:
        console.error("Server error:", message);
        break;
      default:
        if (!status) console.error("Network error. Please check your connection");
    }
    return Promise.reject(error);
  }
);

export default instance;
