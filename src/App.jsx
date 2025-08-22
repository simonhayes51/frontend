import React, { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom"
import Overview from "./pages/Overview"
import Trades from "./pages/Trades"
import Profile from "./pages/Profile"
import AddTrade from "./pages/AddTrade"
import Settings from "./pages/Settings"
import Login from "./pages/Login"

const AppWrapper = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const userIdFromURL = params.get("user_id")
    const storedUserId = localStorage.getItem("user_id")

    if (userIdFromURL) {
      localStorage.setItem("user_id", userIdFromURL)
      setIsLoggedIn(true)
      navigate("/", { replace: true }) // Remove query params
    } else if (storedUserId) {
      setIsLoggedIn(true)
    } else {
      navigate("/login")
    }
  }, [location, navigate])

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {isLoggedIn && (
        <nav className="bg-[#00ff80] text-black px-6 py-4 shadow-md flex justify-between items-center">
          <h1 className="font-bold text-xl">💹 FUT Dashboard</h1>
          <ul className="flex space-x-6 font-semibold items-center">
            <li><Link to="/">Overview</Link></li>
            <li><Link to="/trades">Trades</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/add">Add Trade</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </nav>
      )}

      <main className="p-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Overview />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add" element={<AddTrade />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
)

export default App