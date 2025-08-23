import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "../axios";

const DashboardContext = createContext();
export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("user_id");
    setUserId(id);
    if (id) fetchDashboard(id);
  }, []);

  const fetchDashboard = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/dashboard/${id}`);
      setDashboard(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    if (userId) fetchDashboard(userId);
  };

  return (
    <DashboardContext.Provider value={{ dashboard, loading, refreshDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};
