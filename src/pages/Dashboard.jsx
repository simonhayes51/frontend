import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const [profile, setProfile] = useState(null)
  const [sales, setSales] = useState([])

  // Get user_id from URL query string
  const params = new URLSearchParams(window.location.search)
  const userId = params.get("user_id")

  // Show login button if no user_id in URL
  if (!userId) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1 style={{ color: "#00ffcc" }}>FUT Trader Dashboard</h1>
        <button
          onClick={() => window.location.href = 'https://backend-production-1f1a.up.railway.app/login'}
          style={{
            background: "#5865F2",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem"
          }}
        >
          Login with Discord
        </button>
      </div>
    )
  }

  useEffect(() => {
    axios.get(`https://backend-production-1f1a.up.railway.app/api/profile/${userId}`)
      .then(res => setProfile(res.data))
    axios.get(`https://backend-production-1f1a.up.railway.app/api/sales/${userId}`)
      .then(res => setSales(res.data))
  }, [userId])

  if (!profile) return <p style={{ padding: "2rem" }}>Loading...</p>

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#00ffcc" }}>FUT Trader Dashboard</h1>
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        <StatCard label="Net Profit" value={profile.total_profit} />
        <StatCard label="EA Tax Paid" value={profile.total_tax} />
        <StatCard label="Trades Logged" value={profile.trades} />
        <StatCard label="Balance" value={profile.total_profit + profile.starting_balance} />
      </div>
      <h2>📈 Recent Sales</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sales.map(s => ({ ...s, date: new Date(s.timestamp).toLocaleDateString() }))}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="profit" stroke="#00ffcc" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const StatCard = ({ label, value }) => (
  <div style={{ background: "#1e1e1e", padding: "1rem", borderRadius: "12px", minWidth: "150px", flex: 1 }}>
    <h3 style={{ margin: 0, color: "#888" }}>{label}</h3>
    <p style={{ fontSize: "1.5rem", color: "#fff" }}>{value.toLocaleString()}</p>
  </div>
)

export default Dashboard