import React, { createContext, useState, useEffect } from "react";
import axios from "../axios";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/profile/me");
      setDashboardData(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <DashboardContext.Provider value={{ dashboardData, loading, refreshDashboard: fetchDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};