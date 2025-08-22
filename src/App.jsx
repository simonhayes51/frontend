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
        <nav className="bg-[#00ff80] text-black px-6 py-4 shadow-md flex justify-between items-center">
          <h1 className="font-bold text-xl">💹 FUT Dashboard</h1>
          <ul className="flex space-x-6 font-semibold items-center">
            <li><Link to="/">Overview</Link></li>
            <li><Link to="/trades">Trades</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/add">Add Trade</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            <li>
              <button
                onClick={() => {
                  window.location.href = "https://backend-production-1f1a.up.railway.app/login"
                }}
                className="bg-black text-[#00ff80] px-4 py-2 rounded-md border border-black hover:bg-[#00e673]"
              >
                Login with Discord
              </button>
            </li>
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