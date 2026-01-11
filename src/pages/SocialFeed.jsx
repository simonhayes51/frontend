import { useEffect, useMemo, useState } from "react";
import {
  createPost,
  fetchFeed,
  fetchNotifications,
  fetchRecommendedTraders,
  reactToPost,
  subscribeToTrader,
  unsubscribeFromTrader,
} from "../services/social";

const postTypes = [
  { value: "all", label: "All" },
  { value: "quick_flip", label: "Quick Flip" },
  { value: "prediction", label: "Prediction" },
  { value: "tip", label: "Tip" },
  { value: "analysis", label: "Analysis" },
];

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const getPostAuthor = (post) =>
  post?.author?.display_name ||
  post?.author?.username ||
  post?.author_name ||
  post?.username ||
  "Unknown Trader";

const getTraderName = (trader) =>
  trader?.display_name || trader?.username || trader?.name || "Unnamed Trader";

const SocialFeed = () => {
  const [selectedType, setSelectedType] = useState("all");
  const [feed, setFeed] = useState([]);
  const [feedState, setFeedState] = useState({ loading: true, error: "" });
  const [compose, setCompose] = useState({ content: "", postType: "tip", premium: false });
  const [sending, setSending] = useState(false);
  const [traders, setTraders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [submittingTraderId, setSubmittingTraderId] = useState(null);

  const feedTitle = useMemo(
    () => postTypes.find((type) => type.value === selectedType)?.label || "All",
    [selectedType]
  );

  useEffect(() => {
    let isMounted = true;

    const loadFeed = async () => {
      setFeedState({ loading: true, error: "" });
      try {
        const data = await fetchFeed({ type: selectedType });
        const items = Array.isArray(data) ? data : data?.items ?? data?.posts ?? [];
        if (isMounted) {
          setFeed(items);
          setFeedState({ loading: false, error: "" });
        }
      } catch (error) {
        if (isMounted) {
          setFeedState({
            loading: false,
            error: error?.response?.data?.detail || "Unable to load the social feed.",
          });
        }
      }
    };

    loadFeed();

    return () => {
      isMounted = false;
    };
  }, [selectedType]);

  useEffect(() => {
    let isMounted = true;

    const loadSidebars = async () => {
      try {
        const [traderData, notificationData] = await Promise.all([
          fetchRecommendedTraders({ limit: 6 }),
          fetchNotifications({ limit: 5 }),
        ]);
        if (isMounted) {
          setTraders(traderData || []);
          setNotifications(notificationData || []);
        }
      } catch (error) {
        if (isMounted) {
          setTraders([]);
          setNotifications([]);
        }
      }
    };

    loadSidebars();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleComposeChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCompose((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    if (!compose.content.trim()) return;
    setSending(true);
    try {
      const payload = {
        content: compose.content.trim(),
        post_type: compose.postType,
        is_premium: compose.premium,
      };
      const created = await createPost(payload);
      const nextPost = created?.post || created;
      if (nextPost) {
        setFeed((prev) => [nextPost, ...prev]);
      }
      setCompose({ content: "", postType: compose.postType, premium: false });
    } catch (error) {
      setFeedState((prev) => ({
        ...prev,
        error: error?.response?.data?.detail || "Unable to publish your post.",
      }));
    } finally {
      setSending(false);
    }
  };

  const handleReaction = async (postId, reaction) => {
    try {
      const response = await reactToPost(postId, reaction);
      const updated = response?.post || response?.data || response;
      if (updated?.id) {
        setFeed((prev) => prev.map((post) => (post.id === updated.id ? updated : post)));
      } else {
        setFeed((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  reactions: {
                    ...(post.reactions || {}),
                    [reaction]: (post.reactions?.[reaction] || 0) + 1,
                  },
                }
              : post
          )
        );
      }
    } catch (error) {
      setFeedState((prev) => ({
        ...prev,
        error: error?.response?.data?.detail || "Unable to update reaction.",
      }));
    }
  };

  const handleSubscription = async (trader) => {
    if (!trader?.id) return;
    setSubmittingTraderId(trader.id);
    try {
      if (trader?.is_subscribed) {
        await unsubscribeFromTrader(trader.id);
        setTraders((prev) =>
          prev.map((item) => (item.id === trader.id ? { ...item, is_subscribed: false } : item))
        );
      } else {
        await subscribeToTrader(trader.id);
        setTraders((prev) =>
          prev.map((item) => (item.id === trader.id ? { ...item, is_subscribed: true } : item))
        );
      }
    } catch (error) {
      setFeedState((prev) => ({
        ...prev,
        error: error?.response?.data?.detail || "Unable to update subscription.",
      }));
    } finally {
      setSubmittingTraderId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Social Trading Feed</h1>
          <p className="text-gray-400">
            Follow top traders, share tips, and discover market opportunities.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {postTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSelectedType(type.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                selectedType === type.value
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:text-white"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {feedState.error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {feedState.error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="bg-zinc-900/80 p-4 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold mb-3">Share your latest insight</h2>
            <form className="space-y-3" onSubmit={handleCreatePost}>
              <div className="grid gap-3 md:grid-cols-[1fr_200px]">
                <textarea
                  name="content"
                  rows={3}
                  className="w-full rounded-xl bg-black/40 border border-gray-700/50 p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Post a quick flip, tip, or market prediction..."
                  value={compose.content}
                  onChange={handleComposeChange}
                />
                <div className="space-y-3">
                  <select
                    name="postType"
                    value={compose.postType}
                    onChange={handleComposeChange}
                    className="w-full rounded-xl bg-black/40 border border-gray-700/50 p-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {postTypes
                      .filter((type) => type.value !== "all")
                      .map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                  </select>
                  <label className="flex items-center gap-2 text-xs text-gray-400">
                    <input
                      type="checkbox"
                      name="premium"
                      checked={compose.premium}
                      onChange={handleComposeChange}
                      className="rounded border-gray-600 bg-black/50"
                    />
                    Premium subscribers only
                  </label>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-xl bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? "Posting..." : "Publish"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{feedTitle} posts</h2>
            <span className="text-xs text-gray-400">{feed.length} posts</span>
          </div>

          {feedState.loading ? (
            <div className="rounded-2xl bg-zinc-900/70 p-6 text-gray-400">Loading feed...</div>
          ) : feed.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900/70 p-6 text-gray-400">
              No posts yet. Be the first to share a trade insight.
            </div>
          ) : (
            feed.map((post) => (
              <div key={post.id || post.created_at} className="bg-zinc-900/80 p-4 rounded-2xl shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{getPostAuthor(post)}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="rounded-full bg-gray-800 px-2 py-0.5">
                        {post?.post_type || post?.type || "update"}
                      </span>
                      {post?.is_premium && (
                        <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-yellow-300">
                          Premium
                        </span>
                      )}
                      {post?.expires_at && (
                        <span>Expires {formatDate(post.expires_at)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                </div>
                <p className="mt-3 text-sm text-gray-100 whitespace-pre-line">
                  {post?.content || post?.body || ""}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <button
                    type="button"
                    onClick={() => handleReaction(post.id, "like")}
                    className="rounded-full bg-gray-800/70 px-3 py-1 hover:bg-gray-700"
                  >
                    👍 {post?.reactions?.like ?? post?.likes ?? 0}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReaction(post.id, "dislike")}
                    className="rounded-full bg-gray-800/70 px-3 py-1 hover:bg-gray-700"
                  >
                    👎 {post?.reactions?.dislike ?? post?.dislikes ?? 0}
                  </button>
                  <span className="rounded-full bg-gray-800/70 px-3 py-1">
                    💬 {post?.comments_count ?? post?.comments ?? 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900/80 p-4 rounded-2xl shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recommended Traders</h3>
              <span className="text-xs text-gray-500">Follow to unlock tips</span>
            </div>
            <div className="mt-4 space-y-3">
              {traders.length === 0 ? (
                <p className="text-xs text-gray-500">No recommendations yet.</p>
              ) : (
                traders.map((trader) => (
                  <div key={trader.id || trader.username} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-100">
                        {getTraderName(trader)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {trader.specialty || trader.tagline || "Market specialist"}
                      </p>
                      <p className="text-xs text-gray-500">
                        ⭐ {trader.rating_average ?? trader.rating ?? "New"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSubscription(trader)}
                      disabled={submittingTraderId === trader.id}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                        trader.is_subscribed
                          ? "bg-gray-700 text-white"
                          : "bg-purple-600 text-white hover:bg-purple-500"
                      }`}
                    >
                      {submittingTraderId === trader.id
                        ? "Updating"
                        : trader.is_subscribed
                          ? "Following"
                          : "Follow"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-zinc-900/80 p-4 rounded-2xl shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <span className="text-xs text-gray-500">Latest updates</span>
            </div>
            <div className="mt-4 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500">No notifications right now.</p>
              ) : (
                notifications.map((note) => (
                  <div key={note.id || note.created_at} className="rounded-xl bg-black/40 p-3">
                    <p className="text-xs text-gray-200">
                      {note?.message || note?.title || "Notification"}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">{formatDate(note?.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;
