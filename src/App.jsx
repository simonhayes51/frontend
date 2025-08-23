import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import AddTrade from "./pages/AddTrade";
import Settings from "./pages/Settings";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        {/* Top Navigation */}
        <header className="bg-zinc-900 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
            {/* App Title */}
            <h1 className="text-lime font-bold text-lg">FUT Trader Dashboard</h1>

            {/* Navigation Links */}
            <nav className="flex space-x-6">
              <Link to="/" className="hover:text-lime transition">Dashboard</Link>
              <Link to="/trades" className="hover:text-lime transition">Trades</Link>
              <Link to="/add-trade" className="hover:text-lime transition">Log Trade</Link>
              <Link to="/settings" className="hover:text-lime transition">Settings</Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/add-trade" element={<AddTrade />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;