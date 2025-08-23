import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import AddTrade from "./pages/AddTrade";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar"; // Assuming you already have this

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <div className="max-w-6xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/add-trade" element={<AddTrade />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;