import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";

const Settings = () => {
  const { logout } = useAuth();
  const [startingBalance, setStartingBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSaveBalance = async () => {
    if (!startingBalance || isNaN(startingBalance)) {
      setMessage("Please enter a valid number");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/portfolio/balance", { 
        starting_balance: parseInt(startingBalance) 
      });
      setMessage("Starting balance updated successfully!");
      setStartingBalance("");
    } catch (err) {
      console.error("Failed to update balance:", err);
      setMessage("Failed to update starting balance");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-800' : 'bg-red-800'}`}>
          {message}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold">Starting Balance</label>
          <input
            type="number"
            placeholder="Enter Starting Balance"
            value={startingBalance}
            onChange={(e) => setStartingBalance(e.target.value)}
            className="w-full p-3 rounded bg-zinc-800 text-white"
          />
          <button 
            onClick={handleSaveBalance} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg w-full mt-2 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Balance"}
          </button>
        </div>
        
        <div className="pt-4 border-t border-gray-700">
          <button 
            onClick={handleLogout} 
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg w-full"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
