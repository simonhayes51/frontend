import React from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import Overview from "./pages/Overview"
import Trades from "./pages/Trades"
import Profile from "./pages/Profile"
import AddTrade from "./pages/AddTrade"
import Settings from "./pages/Settings"

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans">
        <nav className="bg-[#00ff80] text-black px-6 py-4 shadow-md flex justify-between">
          <h1 className="font-bold text-xl">💹 FUT Dashboard</h1>
          <ul className="flex space-x-6 font-semibold">
            <li><Link to="/">Overview</Link></li>
            <li><Link to="/trades">Trades</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/add">Add Trade</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </nav>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/add" element={<AddTrade />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App