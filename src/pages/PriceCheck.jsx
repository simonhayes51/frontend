import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import PlayerSearch from "../components/PlayerSearch";
import PlayerCard from "../components/PlayerCard";

export default function PriceCheck() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [graphUrl, setGraphUrl] = useState(null);
  const [error, setError] = useState(null);

  const handlePlayerSelect = async (player) => {
    setSelectedPlayer(player);
    setPriceData(null);
    setGraphUrl(null);
    setError(null);

    try {
      setLoading(true);

      // Fetch player price data
      const res = await axios.get(`/api/pricecheck`, {
        params: {
          player: `${player.name} ${player.rating}`,
          platform: "console",
        },
      });

      setPriceData(res.data);

      // Set graph URL (served by backend)
      setGraphUrl(
        `${import.meta.env.VITE_API_URL}/api/pricegraph?player_name=${encodeURIComponent(player.name + " " + player.rating)}`
      );
    } catch (err) {
      console.error("Failed to fetch player data:", err);
      setError("Failed to fetch player data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-lime-400">💰 Price Check</h1>
      <p className="text-gray-400 mb-6">Search for any player to view live FUTBIN price data.</p>

      <PlayerSearch onSelect={handlePlayerSelect} />

      {loading && (
        <div className="mt-6 text-gray-400 animate-pulse">
          Fetching price data...
        </div>
      )}

      {error && (
        <div className="mt-6 text-red-500 font-medium">{error}</div>
      )}

      {priceData && (
        <div className="mt-6">
          <PlayerCard player={priceData} graphUrl={graphUrl} />
        </div>
      )}
    </div>
  );
}
