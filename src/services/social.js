import axios from "../axios";

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.items ?? payload?.results ?? payload?.data ?? [];
};

export const fetchFeed = ({ type, limit = 20, offset = 0 } = {}) =>
  axios
    .get("/api/feed", {
      params: {
        ...(type && type !== "all" ? { type } : {}),
        limit,
        offset,
      },
    })
    .then((r) => r.data);

export const createPost = (payload) =>
  axios.post("/api/feed", payload).then((r) => r.data);

export const updatePost = (postId, payload) =>
  axios.put(`/api/feed/${postId}`, payload).then((r) => r.data);

export const deletePost = (postId) =>
  axios.delete(`/api/feed/${postId}`).then((r) => r.data);

export const reactToPost = (postId, reaction) =>
  axios
    .post(`/api/interactions/posts/${postId}/reactions`, { reaction })
    .then((r) => r.data);

export const fetchPostComments = (postId, { limit = 50, offset = 0 } = {}) =>
  axios
    .get(`/api/interactions/posts/${postId}/comments`, { params: { limit, offset } })
    .then((r) => r.data);

export const addComment = (postId, payload) =>
  axios.post(`/api/interactions/posts/${postId}/comments`, payload).then((r) => r.data);

export const fetchRecommendedTraders = ({ limit = 6 } = {}) =>
  axios
    .get("/api/subscriptions/recommended", { params: { limit } })
    .then((r) => normalizeList(r.data));

export const subscribeToTrader = (traderId) =>
  axios.post(`/api/subscriptions/${traderId}`).then((r) => r.data);

export const unsubscribeFromTrader = (traderId) =>
  axios.delete(`/api/subscriptions/${traderId}`).then((r) => r.data);

export const fetchNotifications = ({ limit = 10, offset = 0 } = {}) =>
  axios
    .get("/api/notifications", { params: { limit, offset } })
    .then((r) => normalizeList(r.data));
