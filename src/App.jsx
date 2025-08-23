import React, { useEffect, useState } from "react";
import axios from "./axios";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      try {
        const res = await axios.get(`/api/profile/${userId}`);
        setUser(res.data.discord);
      } catch (err) {
        console.error("❌ Failed to fetch Discord profile:", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    window.location.href = "/";
  };

  return (
    <nav className="flex items-center justify-between bg-black p-4">
      <h1 className="text-lime text-2xl font-bold">FUT Trader Dashboard</h1>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <img src={user.avatar} alt="PFP" className="w-8 h-8 rounded-full" />
            <span className="text-white">{user.username}</span>
          </>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;