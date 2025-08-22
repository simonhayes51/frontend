import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const BACKEND_URL = 'https://backend-production-1f1a.up.railway.app'

const Dashboard = () => {
  const [profile, setProfile] = useState(null)
  const [sales, setSales] = useState([])
  const [formData, setFormData] = useState({
    player: '',
    quantity: 1,
    sell: 0,
    profit: 0,
    platform: 'Console',
  })
  const [message, setMessage] = useState('')

  const params = new URLSearchParams(window.location.search)
  const userId = params.get("user_id")

  if (!userId) {
    return (
      <div className="p-8 font-sans text-white">
        <h1 className="text-3xl text-lime-400">FUT Trader Dashboard</h1>
        <button
          onClick={() => window.location.href = `${BACKEND_URL}/login`}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Login with Discord
        </button>
      </div>
    )
  }

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/profile/${userId}`).then(res => setProfile(res.data))
    axios.get(`${BACKEND_URL}/api/sales/${userId}`).then(res => setSales(res.data))
  }, [userId])

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await axios.post(`${BACKEND_URL}/api/logtrade`, { ...formData, user_id: userId })
      setMessage('✅ Trade logged!')
      setFormData({ player: '', quantity: 1, sell: 0, profit: 0, platform: 'Console' })
    } catch (err) {
      setMessage('❌ Error logging trade.')
    }
  }

  const exportCSV = () => {
    window.location.href = `${BACKEND_URL}/api/trades/export/${userId}`
  }

  if (!profile) return <p className="p-8 text-white">Loading...</p>

  return (
    <div className="p-8 font-sans text-white bg-black min-h-screen">
      <h1 className="text-3xl text-lime-400 mb-4">FUT Trader Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Net Profit" value={profile.total_profit} />
        <StatCard label="EA Tax Paid" value={profile.total_tax} />
        <StatCard label="Trades Logged" value={profile.trades} />
        <StatCard label="Balance" value={profile.total_profit + profile.starting_balance} />
      </div>

      <h2 className="text-xl mb-2">📈 Recent Sales</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sales.map(s => ({ ...s, date: new Date(s.timestamp).toLocaleDateString() }))}>
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Line type="monotone" dataKey="profit" stroke="#00ffcc" />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="text-xl mt-10 mb-2">📝 Log a Trade</h2>
      <form onSubmit={handleSubmit} className="grid gap-3 max-w-xl">
        <input name="player" value={formData.player} onChange={handleChange} placeholder="Player Name" required className="p-2 rounded bg-gray-800 text-white" />
        <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="Quantity" className="p-2 rounded bg-gray-800 text-white" />
        <input name="sell" type="number" value={formData.sell} onChange={handleChange} placeholder="Sell Price" className="p-2 rounded bg-gray-800 text-white" />
        <input name="profit" type="number" value={formData.profit} onChange={handleChange} placeholder="Profit" className="p-2 rounded bg-gray-800 text-white" />
        <select name="platform" value={formData.platform} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white">
          <option value="Console">Console</option>
          <option value="PC">PC</option>
        </select>
        <button type="submit" className="bg-lime-500 hover:bg-lime-400 text-black px-4 py-2 rounded">Log Trade</button>
        {message && <p>{message}</p>}
      </form>

      <button
        onClick={exportCSV}
        className="mt-8 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded"
      >
        📤 Export Trades to CSV
      </button>
    </div>
  )
}

const StatCard = ({ label, value }) => (
  <div className="bg-gray-900 p-4 rounded-xl text-center">
    <h3 className="text-gray-400 text-sm mb-1">{label}</h3>
    <p className="text-2xl font-bold">{value.toLocaleString()}</p>
  </div>
)

export default Dashboard