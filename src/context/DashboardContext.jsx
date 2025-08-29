import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../axios";

const Ctx = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [netProfit, setNetProfit] = useState(0);
  const [taxPaid, setTaxPaid] = useState(0);
  const [startingBalance, setStartingBalance] = useState(0);
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) throw new Error("No user_id in localStorage");

        // Adjust endpoints to your backend
        const [sum, t] = await Promise.all([
          axios.get(`/summary?user_id=${user_id}`),
          axios.get(`/trades?user_id=${user_id}&limit=100`),
        ]);

        if (!cancelled) {
          const s = sum?.data || {};
          setNetProfit(Number(s.netProfit || s.net_profit || 0));
          setTaxPaid(Number(s.taxPaid || s.tax_paid || 0));
          setStartingBalance(Number(s.startingBalance || s.starting_balance || 0));

          const list = Array.isArray(t?.data) ? t.data : (t?.data?.trades || []);
          setTrades(list);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Ctx.Provider value={{ netProfit, taxPaid, startingBalance, trades, isLoading, error }}>
      {children}
    </Ctx.Provider>
  );
};

export const useDashboard = () => useContext(Ctx);