import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

// If you already have this in your app, it will be used. Otherwise "" (same-origin)
const API_BASE = import.meta.env.VITE_API_URL || "";

const ORANGE = "#FF3C00"; // stroke
const BG_GRID = "#292d3e"; // grid lines
const AXIS_LINE = "#1b1e29"; // axis line
const TICK = "#878c9c"; // tick text
const PANEL = "bg-darker-gray"; // parent card bg (you already use this)

// --- Small utils ---
const currency = (n) =>
  typeof n === "number"
    ? n >= 1000
      ? `${Math.round(n / 100) / 10}K`.replace(".0K", "K")
      : n.toLocaleString()
    : "";

const formatTime = (date, tf) => {
  const d = new Date(date);
  if (tf === "today" || tf === "3d" || tf === "week") {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(d);
  }
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short"
  }).format(d);
};

// Normalise a few possible backend shapes into [{time, price}]
function normalisePoints(payload) {
  if (!payload) return [];
  // Preferred shape: { points: [{ t: isoString, price: number }, ...] }
  if (Array.isArray(payload.points)) {
    return payload.points
      .filter((p) => p && p.t != null && p.price != null)
      .map((p) => ({ time: new Date(p.t).toISOString(), price: Number(p.price) }));
  }
  // Fallback: { series: [{ data: [[ts, price], ...] }] }  (FUTBIN-style Highcharts)
  if (payload.series && payload.series[0] && Array.isArray(payload.series[0].data)) {
    return payload.series[0].data
      .filter((row) => Array.isArray(row) && row.length >= 2)
      .map(([ts, pr]) => ({ time: new Date(ts).toISOString(), price: Number(pr) }));
  }
  // Super fallback: raw array of { time, price }
  if (Array.isArray(payload)) {
    return payload
      .filter((p) => p && p.time && p.price != null)
      .map((p) => ({ time: new Date(p.time).toISOString(), price: Number(p.price) }));
  }
  return [];
}

const timeframes = [
  { key: "year", label: "Year" },
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "3d", label: "3 Days" },
  { key: "today", label: "Today" }
];

/**
 * PriceTrendChart
 *
 * Props:
 * - playerId: string | number (required)
 * - platform: "ps" | "xbox" | "pc" (default: "ps")
 * - initialTimeframe: one of ["today","3d","week","month","year"] (default: "today")
 * - height: tailwind h- value or number in px (default: 300)
 * - className: extra classes for the outer wrapper
 *
 * Backend expectation: GET `${API_BASE}/api/price-history?playerId=..&platform=..&tf=..`
 * Should return one of the supported shapes handled by normalisePoints().
 * Hook it to your existing /pricecheck graph endpoint if you prefer — just adjust the URL build below.
 */
export default function PriceTrendChart({
  playerId,
  platform = "ps",
  initialTimeframe = "today",
  height = 300,
  className = ""
}) {
  const [tf, setTf] = useState(initialTimeframe);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!playerId) return;
    let aborted = false;

    async function run() {
      setLoading(true);
      setError("");
      try {
        // Adjust this URL to match your backend route. This is the cleanest plug.
        const url = `${API_BASE}/api/price-history?playerId=${encodeURIComponent(
          playerId
        )}&platform=${encodeURIComponent(platform)}&tf=${encodeURIComponent(tf)}`;

        const r = await fetch(url, { credentials: "include" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (aborted) return;
        setPoints(normalisePoints(data));
      } catch (e) {
        if (aborted) return;
        setError(e?.message || "Failed to load price history");
        setPoints([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    run();
    return () => {
      aborted = true;
    };
  }, [playerId, platform, tf]);

  const chartData = useMemo(
    () => points.map((p) => ({
      x: p.time,
      y: p.price
    })),
    [points]
  );

  return (
    <div className={`w-full pt-3 ${PANEL} rounded-lg ${className}`}>
      {/* Timeframe Pills (mobile-first, like in your screenshot) */}
      <div className="mb-2 xl:hidden">
        <div className="table mx-auto">
          <div className="rounded-full bg-darkest-gray p-1 flex flex-row h-[40px]">
            {timeframes.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTf(key)}
                className={[
                  "rounded-full py-2 md:px-4 px-3 text-center font-bold md:text-xs text-xxs uppercase",
                  key === tf ? "bg-orange text-black" : "text-white"
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pr-4">
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 55, right: 0, top: 0, bottom: 35 }}>
              {/* Background grid replication */}
              <CartesianGrid stroke={BG_GRID} vertical horizontal />

              {/* X Axis */}
              <XAxis
                dataKey="x"
                tickFormatter={(v) => formatTime(v, tf)}
                stroke={AXIS_LINE}
                tick={{ fill: TICK, fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: AXIS_LINE }}
                tickLine={{ stroke: BG_GRID }}
                interval="preserveStartEnd"
                minTickGap={32}
              />

              {/* Y Axis */}
              <YAxis
                dataKey="y"
                tickFormatter={(v) => currency(v)}
                stroke={AXIS_LINE}
                tick={{ fill: TICK, fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: AXIS_LINE }}
                tickLine={{ stroke: BG_GRID }}
                width={55}
              />

              {/* Tooltip */}
              <Tooltip
                contentStyle={{
                  background: "#0e1016",
                  border: "1px solid #1b1e29",
                  borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  padding: "8px 10px"
                }}
                labelFormatter={(v) => formatTime(v, tf)}
                formatter={(value) => [value?.toLocaleString?.() ?? value, "Coins"]}
              />

              {/* Gradient fill */}
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ORANGE} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Area + line + dots */}
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

        {/* Loading / error states */}
        {loading && (
          <div className="text-center text-sm text-slate-400 py-2">Loading price history…</div>
        )}
        {!loading && error && (
          <div className="text-center text-sm text-red-400 py-2">{error}</div>
        )}
        {!loading && !error && chartData.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-2">No data for this period.</div>
        )}
      </div>
    </div>
  );
}
