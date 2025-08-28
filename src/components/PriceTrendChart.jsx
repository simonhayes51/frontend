// src/components/PriceTrendChart.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "";

// theme colors
const ORANGE = "#91dc30";
const GRID = "#292d3e";
const AXIS = "#1b1e29";
const TICK = "#878c9c";

// timeframes used by backend
const TIMEFRAMES = [
  { key: "today", label: "Today" },
  { key: "3d", label: "3 Days" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

// small helpers
const abbreviate = (n) => {
  if (typeof n !== "number") return "";
  if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}M`.replace(".0M", "M");
  if (n >= 1_000) return `${Math.round(n / 100) / 10}K`.replace(".0K", "K");
  return n.toLocaleString();
};

const formatTickTime = (iso, tf) => {
  const d = new Date(iso);
  if (tf === "today" || tf === "3d" || tf === "week") {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  }
  return new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short" }).format(d);
};

// normalize server responses
function normalizePoints(payload) {
  if (!payload) return [];
  // preferred shape: { points: [{ t, price }] }
  if (Array.isArray(payload.points)) {
    return payload.points
      .filter((p) => p && p.t && p.price != null)
      .map((p) => ({ time: new Date(p.t).toISOString(), price: Number(p.price) }));
  }
  // fallback: series[0].data = [[ts, price], ...]
  if (payload.series && payload.series[0] && Array.isArray(payload.series[0].data)) {
    return payload.series[0].data
      .filter((row) => Array.isArray(row) && row.length >= 2)
      .map(([ts, pr]) => ({ time: new Date(ts).toISOString(), price: Number(pr) }));
  }
  // raw array: [{ time, price }]
  if (Array.isArray(payload)) {
    return payload
      .filter((p) => p && p.time && p.price != null)
      .map((p) => ({ time: new Date(p.time).toISOString(), price: Number(p.price) }));
  }
  return [];
}

/**
 * Props:
 * - playerId (required)
 * - platform = "ps"
 * - initialTimeframe = "today"
 * - height = 300
 * - className = ""
 */
export default function PriceTrendChart({
  playerId,
  platform = "ps",
  initialTimeframe = "today",
  height = 300,
  className = "",
}) {
  const [tf, setTf] = useState(initialTimeframe);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!playerId) return;
    let aborted = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const url =
          `${API_BASE}/api/price-history?` +
          `playerId=${encodeURIComponent(playerId)}` +
          `&platform=${encodeURIComponent(platform)}` +
          `&tf=${encodeURIComponent(tf)}`;
        const r = await fetch(url, { credentials: "include" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (aborted) return;
        setPoints(normalizePoints(data));
      } catch (e) {
        if (!aborted) {
          setError(e?.message || "Failed to load price history");
          setPoints([]);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [playerId, platform, tf]);

  const chartData = useMemo(
    () => points.map((p) => ({ x: p.time, y: p.price })),
    [points]
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Timeframe controls — ALWAYS visible, wraps on small screens */}
      <div className="mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {TIMEFRAMES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTf(key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
                ${tf === key ? "bg-orange-500 text-black" : "bg-[#1e293b] text-gray-300 hover:bg-[#2b3a52]"}`}
              aria-pressed={tf === key}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 55, right: 0, top: 0, bottom: 35 }}>
            <CartesianGrid stroke={GRID} vertical horizontal />

            <XAxis
              dataKey="x"
              tickFormatter={(v) => formatTickTime(v, tf)}
              stroke={AXIS}
              tick={{ fill: TICK, fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: AXIS }}
              tickLine={{ stroke: GRID }}
              interval="preserveStartEnd"
              minTickGap={32}
            />

            <YAxis
              dataKey="y"
              tickFormatter={(v) => abbreviate(v)}
              stroke={AXIS}
              tick={{ fill: TICK, fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: AXIS }}
              tickLine={{ stroke: GRID }}
              width={55}
              domain={[
                0, // keep 0 at the bottom
                (dataMax) => Math.ceil(dataMax * 1.1), // add 10% headroom above the max
              ]}
            />

            <Tooltip
              contentStyle={{
                background: "#0e1016",
                border: "1px solid #1b1e29",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                padding: "8px 10px",
              }}
              labelFormatter={(v) => formatTickTime(v, tf)}
              formatter={(value) => [value?.toLocaleString?.() ?? value, "Coins"]}
            />

            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ORANGE} stopOpacity={0.8} />
                <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey="y"
              stroke={ORANGE}
              fill="url(#chartFill)"
              fillOpacity={0.6}
              dot={{ r: 3, stroke: ORANGE, fill: "#c93600", strokeWidth: 1 }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* states */}
      {loading && <div className="text-center text-sm text-slate-400 py-2">Loading price history…</div>}
      {!loading && error && <div className="text-center text-sm text-red-400 py-2">{error}</div>}
      {!loading && !error && chartData.length === 0 && (
        <div className="text-center text-sm text-slate-400 py-2">No data for this period.</div>
      )}
    </div>
  );
}
