import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../axios";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = new URLSearchParams(window.location.search).get("user_id");

  const fetchDashboard = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/dashboard/${userId}`);
      setDashboard(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard when the page loads
  useEffect(() => {
    fetchDashboard();
  }, [userId]);

  return (
    <DashboardContext.Provider value={{ dashboard, loading, fetchDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
