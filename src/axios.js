import axios from "axios"

const instance = axios.create({
  baseURL: "https://backend-production-1f1a.up.railway.app",
})

// Automatically include user_id from localStorage in GET requests
instance.interceptors.request.use((config) => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem("user_id")
    if (userId && config.method === "get") {
      config.params = { ...(config.params || {}), user_id: userId }
    }
  }
  return config
})

export default instance