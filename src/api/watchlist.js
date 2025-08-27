import api from "../axios";

export const getWatchlist = () => api.get("/watchlist").then(r => r.data);
export const addWatch = (payload) => api.post("/watchlist", payload).then(r => r.data);
export const deleteWatch = (id) => api.delete(`/watchlist/${id}`).then(r => r.data);
export const refreshWatch = (id) => api.post(`/watchlist/${id}/refresh`).then(r => r.data);
