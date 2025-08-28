// src/pages/Trades.jsx
import React, { useEffect, useState } from "react";
import { useDashboard } from "../context/DashboardContext";

const API_BASE = import.meta.env.VITE_API_URL || "";

/* ---------- helpers ---------- */
const safeNumber = (value) => Number(value || 0).toLocaleString();
const safeDate = (date) => {
  try {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

async function putUpdateTrade(tradeId, patch) {
  const r = await fetch(`${API_BASE}/api/trades/${tradeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`Update failed (${r.status})`);
  return r.json();
}

/* ---------- inline edit modal ---------- */
function EditModal({ open, trade, onClose, onSaved }) {
  const [form, setForm] = useState({
    player: "",
    version: "",
    quantity: 1,
    buy: 0,
    sell: 0,
    notes: "",
    timestamp: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (trade) {
      setForm({
        player: trade.player ?? "",
        version: trade.version ?? "",
        quantity: Number(trade.quantity ?? 1),
        buy: Number(trade.buy ?? 0),
        sell: Number(trade.sell ?? 0),
        notes: trade.notes ?? "",
        timestamp: trade.timestamp
          ? new Date(trade.timestamp).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [trade]);

  if (!open || !trade) return null;

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]:
        e.target.type === "number"
          ? Number(e.target.value || 0)
          : e.target.value,
    }));

  const submit = async (e) => {
    e.preventDefault();
    if (!trade.id) return;
    setSaving(true);
    setError("");
    try {
      const patch = {
        player: form.player,
        version: form.version,
        quantity: form.quantity,
        buy: form.buy,
        sell: form.sell,
        notes: form.notes,
        timestamp: form.timestamp
          ? new Date(form.timestamp).toISOString()
          : undefined,
      };
      Object.keys(patch).forEach(
        (k) => patch[k] === undefined && delete patch[k]
      );
      const updated = await putUpdateTrade(trade.id, patch);

      // Client-side fallback calc if backend doesn't return ea_tax/profit
      if (updated) {
        const sell = Number(updated.sell || 0);
        const buy = Number(updated.buy || 0);
        const tax = Math.round(sell * 0.05);
        if (updated.ea_tax == null) updated.ea_tax = tax;
        if (updated.profit == null) updated.profit = sell - buy - tax;
      }

      onSaved(updated);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Trade</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-red-900/40 px-3 py-2 text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-300">Player</span>
            <input
              className="rounded-lg bg-zinc-800 px-3 py-2"
              value={form.player}
              onChange={set("player")}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-300">Version</span>
            <input
              className="rounded-lg bg-zinc-800 px-3 py-2"
              value={form.version}
              onChange={set("version")}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-300">Quantity</span>
            <input
              type="number"
              min="1"
              className="rounded-lg bg-zinc-800 px-3 py-2"
              value={form.quantity}
              onChange={set("quantity")}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-300">Buy</span>
            <input
              type="number"
              min="0"
              className="rounded-lg bg-zinc-800 px-3 py-2"
              value={form.buy}
              onChange={set("buy")}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-300">Sell</span>
            <input
              type="number"
              min="0"
              className="rounded-lg bg-zinc-800 px-3 py-2"
              value={form.sell}
              onChange={set("sell")}
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="text-sm text-zinc-300">Notes</span>
            <textarea
              className="rounded-lg bg-zinc-800 px-3 py-2"
              rows={3}
              value={form.notes}
              onChange={set("notes")}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-300">Date/Time</span>
            <input
              type="datetime-local"
              className="rounded-lg bg-zinc-800 px-3 py-2"
              value={form.timestamp}
              onChange={set("timestamp")}
            />
          </label>

          <div className="md:col-span-2 mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="rounded-lg bg-lime-500/90 px-4 py-2 font-semibold text-black hover:bg-lime-400 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
const Trades = () => {
  const { getAllTrades } = useDashboard();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const result = await getAllTrades();
        if (result.success) {
          setTrades(result.trades);
        } else {
          console.error("Failed to fetch trades:", result.message);
        }
      } catch (err) {
        console.error("Failed to fetch trades:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, [getAllTrades]);

  const startEdit = (t) => {
    if (!t?.id) return; // need primary key to update
    setCurrent(t);
    setModalOpen(true);
  };

  const onSaved = (updated) => {
    setTrades((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
    setModalOpen(false);
    setCurrent(null);
  };

  if (loading) return <p className="text-gray-400">Loading trades...</p>;

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Trade History</h1>
      {trades.length === 0 ? (
        <p className="text-gray-400">No trades logged yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="py-2">Player</th>
                <th>Version</th>
                <th>Qty</th>
                <th>Buy</th>
                <th>Sell</th>
                <th>Profit</th>
                <th>Date</th>
                <th className="w-28 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <tr key={trade.id ?? i} className="border-b border-gray-800">
                  <td className="py-2">{trade.player || "N/A"}</td>
                  <td>{trade.version || "N/A"}</td>
                  <td>{trade.quantity || 0}</td>
                  <td>{safeNumber(trade.buy)}</td>
                  <td>{safeNumber(trade.sell)}</td>
                  <td
                    className={
                      (trade.profit || 0) >= 0 ? "text-green-400" : "text-red-400"
                    }
                  >
                    {safeNumber(trade.profit)}
                  </td>
                  <td>{safeDate(trade.timestamp)}</td>
                  <td className="py-2 pr-2 text-right">
                    {trade.id ? (
                      <button
                        onClick={() => startEdit(trade)}
                        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700"
                        title="Edit trade"
                      >
                        Edit
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500">no id</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditModal
        open={modalOpen}
        trade={current}
        onClose={() => {
          setModalOpen(false);
          setCurrent(null);
        }}
        onSaved={onSaved}
      />
    </div>
  );
};

export default Trades;
