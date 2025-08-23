import React, { useEffect, useState } from "react";
import axios from "../axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("❌ No user_id found in localStorage");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/profile/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading trader profile...</p>;
  }

  if (!profile) {
    return <p className="text-gray-400">No trading data found yet.</p>;
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">🧳 Trader Profile</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-black/40 p-4 rounded-xl">
          <h2 className="text-lg font-semibold">💰 Total Profit</h2>
          <p className="text-3xl font-bold text-lime">{profile.totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-black/40 p-4 rounded-xl">
          <h2 className="text-lg font-semibold">📊 Trades Logged</h2>
          <p className="text-3xl font-bold text-lime">{profile.tradesLogged}</p>
        </div>
        <div className="bg-black/40 p-4 rounded-xl">
          <h2 className="text-lg font-semibold">📈 Win Rate</h2>
          <p className="text-3xl font-bold text-lime">{profile.winRate}%</p>
        </div>
        <div className="bg-black/40 p-4 rounded-xl">
          <h2 className="text-lg font-semibold">🏮 Most Used Tag</h2>
          <p className="text-3xl font-bold text-lime">{profile.mostUsedTag}</p>
        </div>
        {profile.bestTrade && (
          <div className="bg-black/40 p-4 rounded-xl md:col-span-2">
            <h2 className="text-lg font-semibold">🏆 Best Trade</h2>
            <p className="text-xl font-bold text-lime">
              {profile.bestTrade.player} ({profile.bestTrade.version}) → +{profile.bestTrade.profit.toLocaleString()} coins
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;