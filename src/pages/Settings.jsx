import React, { useState } from "react";
import axios from "../axios";

const Settings = () => {
  const [startingBalance, setStartingBalance] = useState("");

  const handleSaveBalance = async () => {
    try {
      await axios.post("/api/profile/start_balance", { starting_balance: startingBalance });
      alert("✅ Starting balance updated!");
    } catch (err) {
      alert("❌ Failed to update starting balance");
    }
  };

  const handleLogout = () => {
    window.location.href = "/login";
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">⚙️ Settings</h2>
      <div className="space-y-4">
        <input
          type="number"
          placeholder="Enter Starting Balance"
          value={startingBalance}
          onChange={(e) => setStartingBalance(e.target.value)}
          className="w-full p-3 rounded bg-zinc-800"
        />
        <button onClick={handleSaveBalance} className="bg-lime text-black py-3 px-6 rounded-lg w-full">
          Save Balance
        </button>
        <button onClick={handleLogout} className="bg-red-600 text-white py-3 px-6 rounded-lg w-full">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;