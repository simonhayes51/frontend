import axios from "axios"

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://backend-production-1f1a.up.railway.app",
})

// Inject user_id into every request
instance.interceptors.request.use(config => {
  const userId = localStorage.getItem("user_id")
  if (userId) {
    config.headers["x-user-id"] = userId
  }
  return config
})

export default instance