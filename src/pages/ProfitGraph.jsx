import React, { useEffect, useState } from "react";
import axios from "../axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ProfitGraph = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("/api/trades/history")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="bg-zinc-900 p-6 rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">📊 Profit Over Time</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="profit" stroke="#32CD32" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitGraph;