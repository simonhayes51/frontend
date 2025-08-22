import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const API_BASE = "https://backend-production-1f1a.up.railway.app/api"
const userId = "1234567890" // 🔁 Replace with real Discord user ID

const Dashboard = () => {
  const [profile, setProfile] = useState(null)
  const [sales, setSales] = useState([])

  useEffect(() => {
    axios.get(`${API_BASE}/profile/${userId}`).then(res => setProfile(res.data))
    axios.get(`${API_BASE}/sales/${userId}`).then(res => setSales(res.data))
  }, [])

  if (!profile) return <p style={{ padding: "2rem" }}>Loading...</p>

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", background: "#121212", color: "#fff", minHeight: "100vh" }}>
      <h1 style={{ color: "#00ffcc", marginBottom: "2rem" }}>FUT Trader Dashboard</h1>

      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "3rem", flexWrap: "wrap" }}>
        <StatCard label="💰 Net Profit" value={profile.total_profit} />
        <StatCard label="💸 EA Tax Paid" value={profile.total_tax} />
        <StatCard label="🧾 Trades Logged" value={profile.trades} />
        <StatCard label="🏦 Current Balance" value={profile.total_profit + profile.starting_balance} />
      </div>

      <h2 style={{ marginBottom: "1rem" }}>📈 Recent Sales</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sales.map(s => ({ ...s, date: new Date(s.timestamp).toLocaleDateString() }))}>
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Line type="monotone" dataKey="profit" stroke="#00ffcc" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const StatCard = ({ label, value }) => (
  <div style={{
    background: "#1f1f1f",
    padding: "1.5rem",
    borderRadius: "12px",
    minWidth: "180px",
    flex: 1,
    boxShadow: "0 0 10px rgba(0, 255, 204, 0.2)"
  }}>
    <h3 style={{ margin: 0, color: "#00ffcc", fontSize: "1rem" }}>{label}</h3>
    <p style={{ fontSize: "1.8rem", fontWeight: "bold", marginTop: "0.5rem" }}>{value.toLocaleString()}</p>
  </div>
)

export default Dashboard
