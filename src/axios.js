// 📁 src/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://backend-production-1f1a.up.railway.app/api",
});

instance.interceptors.request.use((config) => {
  const userId = localStorage.getItem("user_id");
  if (userId) {
    config.url += config.url.includes("?") ? `&user_id=${userId}` : `?user_id=${userId}`;
  }
  return config;
});

export default instance;
