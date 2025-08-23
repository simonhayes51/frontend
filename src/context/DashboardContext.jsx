import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../axios";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const userId =
        new URLSearchParams(window.location.search).get("user_id") ||
        localStorage.getItem("user_id");

      if (!userId) {
        console.error("❌ No user_id found in URL or localStorage");
        setLoading(false);
        return;
      }

      localStorage.setItem("user_id", userId); // ✅ Persist for reloads
      console.log(`🔄 Fetching dashboard for user_id=${userId}`);

      const res = await axios.get(`/api/dashboard/${userId}`);
      console.log("✅ Dashboard data:", res.data);

      setDashboard(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <DashboardContext.Provider value={{ dashboard, loading, fetchDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
