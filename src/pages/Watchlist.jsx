import React, { useEffect, useMemo, useState } from "react";
import { getWatchlist, addWatch, deleteWatch, refreshWatch } from "../api/watchlist";
import { X, Plus, RefreshCw, Trash2, ArrowUpDown } from "lucide-react";

function Price({ value }) {
  if (value === null || value === undefined) return <span className="text-gray-400">N/A</span>;
  return <span className="font-semibold">{value.toLocaleString()}</span>;
}

function Change({ change, pct }) {
  if (change === null || change === undefined || pct === null || pct === undefined) return <span className="text-gray-400">—</span>;
  const up = change > 0;
  return (
    <span className={up ? "text-emerald-400 font-semibold" : change < 0 ? "text-red-400 font-semibold" : "text-gray-300"}>
      {up ? "↑" : change < 0 ? "↓" : "•"} {change.toLocaleString()} ({pct}%)
    </span>
  );
}

const SORTS = {
  SMART: "smart",
  CHANGE_DESC: "change_desc",
  PRICE_ASC: "price_asc",
  PRICE_DESC: "price_desc",
  ADDED_NEWEST: "added_newest",
};

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ player_name: "", card_id: "", version: "", platform: "ps", notes: "" });
  const [busyAdd, setBusyAdd] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [sort, setSort] = useState(SORTS.SMART);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getWatchlist();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sorted = useMemo(() => {
    const list = [...items];

    switch (sort) {
      case SORTS.CHANGE_DESC:
        list.sort((a, b) => (b.change_pct ?? -Infinity) - (a.change_pct ?? -Infinity));
        break;
      case SORTS.PRICE_ASC:
        list.sort((a, b) => (a.current_price ?? Infinity) - (b.current_price ?? Infinity));
        break;
      case SORTS.PRICE_DESC:
        list.sort((a, b) => (b.current_price ?? -Infinity) - (a.current_price ?? -Infinity));
        break;
      case SORTS.ADDED_NEWEST:
        list.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
        break;
      case SORTS.SMART:
      default:
        list.sort((a, b) => {
          if (a.is_extinct !== b.is_extinct) return a.is_extinct ? 1 : -1; // extincts last
          const ap = a.change_pct ?? -Infinity, bp = b.change_pct ?? -Infinity;
          if (bp !== ap) return bp - ap;                                    // highest % first
          const aa = Math.abs(a.change ?? -Infinity), ba = Math.abs(b.change ?? -Infinity);
          if (ba !== aa) return ba - aa;                                    // tie-break by abs change
          return new Date(b.started_at) - new Date(a.started_at);           // newest last tie-break
        });
        break;
    }
    return list;
  }, [items, sort]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.player_name || !form.card_id) return;
    setBusyAdd(true);
    try {
      await addWatch({
        player_name: form.player_name.trim(),
        card_id: Number(form.card_id),
        version: form.version || null,
        platform: form.platform,
        notes: form.notes || null,
      });
      setShowAdd(false);
      setForm({ player_name: "", card_id: "", version: "", platform: form.platform, notes: "" });
      await load();
    } finally {
      setBusyAdd(false);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await deleteWatch(id);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const handleRefreshRow = async (id) => {
    setBusyId(id);
    try {
      await refreshWatch(id);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Player Watchlist</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-900/70 border border-[#2A2F36] rounded-md px-2 py-1 text-gray-300">
            <ArrowUpDown className="w-4 h-4" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent text-sm outline-none" title="Sort">
              <option value={SORTS.SMART}>Smart</option>
              <option value={SORTS.CHANGE_DESC}>% Change ↓</option>
              <option value={SORTS.PRICE_DESC}>Current Price ↓</option>
              <option value={SORTS.PRICE_ASC}>Current Price ↑</option>
              <option value={SORTS.ADDED_NEWEST}>Recently Added</option>
            </select>
          </div>

          <button onClick={load} className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-2" title="Refresh all">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button onClick={() => setShowAdd(true)} className="px-3 py-2 rounded-md bg-lime-500/90 hover:bg-lime-500 text-black font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="bg-[#111318]/70 rounded-xl border border-[#2A2F36] overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 text-xs uppercase tracking-wider text-gray-400 bg-black/30">
          <div className="col-span-4">Player</div>
          <div className="col-span-2">Started</div>
          <div className="col-span-2">Current</div>
          <div className="col-span-2">Change</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-6 text-gray-400">Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="p-6 text-gray-400">No players yet. Add your first watch using the button above.</div>
        ) : (
          <ul className="divide-y divide-[#1c1f26]">
            {sorted.map((it) => (
              <li key={it.id} className="grid grid-cols-12 px-4 py-3 items-center text-sm">
                <div className="col-span-4">
                  <div className="text-white font-semibold">{it.player_name}</div>
                  <div className="text-xs text-gray-400">ID {it.card_id} • {it.version || "Base"} • {it.platform.toUpperCase()}</div>
                </div>
                <div className="col-span-2 text-gray-200"><Price value={it.started_price} /></div>
                <div className="col-span-2 text-gray-200">
                  {it.is_extinct ? <span className="text-yellow-400 font-semibold">Extinct</span> : <Price value={it.current_price} />}
                  {it.updated_at && <div className="text-[10px] text-gray-500">Updated {new Date(it.updated_at).toLocaleString()}</div>}
                </div>
                <div className="col-span-2"><Change change={it.change} pct={it.change_pct} /></div>
                <div className="col-span-2 text-right flex justify-end gap-2">
                  <button onClick={() => handleRefreshRow(it.id)} disabled={busyId === it.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-xs" title="Refresh price">
                    <RefreshCw className={`w-4 h-4 ${busyId === it.id ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <button onClick={() => handleDelete(it.id)} disabled={busyId === it.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white text-xs">
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-[#111318] border border-[#2A2F36] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Add to Watchlist</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Player name</label>
                <input className="w-full px-3 py-2 rounded-md bg-black/40 border border-[#2A2F36] text-white" value={form.player_name} onChange={(e) => setForm((f) => ({ ...f, player_name: e.target.value }))} placeholder="e.g., Bukayo Saka" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Card ID (EA/FUT.GG)</label>
                <input className="w-full px-3 py-2 rounded-md bg-black/40 border border-[#2A2F36] text-white" value={form.card_id} onChange={(e) => setForm((f) => ({ ...f, card_id: e.target.value.replace(/\D/g, "") }))} placeholder="e.g., 100664475" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Version</label>
                  <input className="w-full px-3 py-2 rounded-md bg-black/40 border border-[#2A2F36] text-white" value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} placeholder="Base / IF / RTTK …" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Platform</label>
                  <select className="w-full px-3 py-2 rounded-md bg-black/40 border border-[#2A2F36] text-white" value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}>
                    <option value="ps">PS</option>
                    <option value="xbox">Xbox</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Notes (optional)</label>
                <textarea className="w-full px-3 py-2 rounded-md bg-black/40 border border-[#2A2F36] text-white" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Target buy/sell, reasons, etc." />
              </div>
              <button disabled={busyAdd} className="w-full py-2 rounded-md bg-lime-500/90 hover:bg-lime-500 text-black font-bold">
                {busyAdd ? "Adding…" : "Add to Watchlist"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

