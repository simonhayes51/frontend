import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddTrade from "./pages/AddTrade";
import Settings from "./pages/Settings";
import { DashboardProvider } from "./context/DashboardContext";

const App = () => {
  return (
    <DashboardProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <nav className="bg-zinc-900 px-6 py-4 shadow flex justify-between items-center">
            <Link to="/" className="text-lime font-bold text-xl">
              FUT Trader Dashboard
            </Link>
            <div className="space-x-6">
              <Link to="/" className="hover:text-lime">Dashboard</Link>
              <Link to="/add-trade" className="hover:text-lime">Add Trade</Link>
              <Link to="/settings" className="hover:text-lime">Settings</Link>
            </div>
          </nav>

          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-trade" element={<AddTrade />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </DashboardProvider>
  );
};

export default App;
