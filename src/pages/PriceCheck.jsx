import React, { useState } from "react";
import axios from "../utils/axios";

export default function PriceCheck() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("ps");
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`/api/pricecheck`, {
        params: { player_id: query, platform },
      });
      setPriceData(res.data);
    } catch (err) {
      setError("Could not fetch price data. Try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">🎮 Price Check</h1>
      <div className="flex gap-4 mb-6">
        <input
          className="p-3 w-1/2 bg-gray-800 rounded-lg text-white"
          placeholder="Enter Player ID (e.g. 247819)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="p-3 bg-gray-800 rounded-lg text-white"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="ps">PlayStation</option>
          <option value="xbox">Xbox</option>
          <option value="pc">PC</option>
        </select>

        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-lime-500 hover:bg-lime-600 text-black font-bold rounded-lg"
        >
          {loading ? "Loading..." : "Check"}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {priceData && (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold">Player Price</h2>
          {priceData.price ? (
            <p className="text-2xl mt-2 font-semibold text-lime-400">
              {priceData.price.toLocaleString()} coins
            </p>
          ) : (
            <p className="text-yellow-400">Price not available</p>
          )}
        </div>
      )}
    </div>
  );
}
