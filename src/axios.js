import axios from "axios"

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://backend-production-1f1a.up.railway.app",
  withCredentials: true, // ✅ THIS IS THE KEY
})

export default instance