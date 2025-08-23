import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import "./index.css";

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("user_id");
if (userId) {
  localStorage.setItem("user_id", userId);
}

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-white">
        <nav className="flex justify-between items-center bg-zinc-900 p-4 shadow-lg">
          <h1 className="text-xl font-bold text-lime">FUT Trader Dashboard</h1>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-lime">Dashboard</Link>
            <Link to="/settings" className="hover:text-lime">Settings</Link>
          </div>
        </nav>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;