// src/pages/Watchlist.jsx
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { getWatchlist, addWatch, deleteWatch, refreshWatch } from "../api/watchlist";
import { Link } from "react-router-dom";
import api from "../axios"; // <- use your axios base instance

// Tiny inline icons to keep deps minimal
const Icon = {
  Plus: (props) => (
    <svg className={`w-4 h-4 ${props.className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  ),
  Refresh: (props) => (
    <svg className={`w-4 h-4 ${props.className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 8a8 8 0 10-1.78 5.091" />
    </svg>
  ),
  Trash: (props) => (
    <svg className={`w-4 h-4 ${props.className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0l1-3h6l1 3" />
    </svg>
  ),
  Sort: (props) => (
    <svg className={`w-4 h-4 ${props.className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7h13M3 12h9M3 17h5" />
    </svg>
  ),
};

function Price({ value }) {
  if (value === null || value === undefined) return <span className="text-gray-400">N/A</span>;
  return <span className="font-semibold">{Number(value).toLocaleString()}</span>;
}

function Change({ change, pct }) {
  if (change === null || change === undefined || pct === null || pct === undefined)
    return <span className="text-gray-400">—</span>;
  const up = change > 0;
  return (
    <span className={up ? "text-emerald-400 font-semibold" : change < 0 ? "text-red-400 font-semibold" : "text-gray-300"}>
      {up ? "↑" : change < 0 ? "↓" : "•"} {Number(change).toLocaleString()} ({pct}%)
    </span>
  );
}

const SORTS = {
  SMART: "smart",
  CHANGE_DESC: "change_desc",
  PRICE_ASC: "price_asc",
  PRICE_DESC: "price_desc",
  ADDED_NEWEST: "added_newest",
  NAME_ASC: "name_asc",
};

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ player_name: "", card_id: "", version: "", platform: "ps", notes: "" });
  const [busyAdd, setBusyAdd] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [sort, setSort] = useState(SORTS.SMART);

  // autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [sugOpen, setSugOpen] = useState(false);
  const abortRef = useRef(null);
  const inputRef = useRef(null);

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

  // sort
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
      case SORTS.NAME_ASC:
        list.sort((a, b) => (a.player_name || "").localeCompare(b.player_name || ""));
        break;
      case SORTS.SMART:
      default:
        list.sort((a, b) => {
          if (a.is_extinct !== b.is_extinct) return a.is_extinct ? 1 : -1;
          const ap = a.change_pct ?? -Infinity, bp = b.change_pct ?? -Infinity;
          if (bp !== ap) return bp - ap;
          const aa = Math.abs(a.change ?? -Infinity), ba = Math.abs(b.change ?? -Infinity);
          if (ba !== aa) return ba - aa;
          return new Date(b.started_at) - new Date(a.started_at);
        });
        break;
    }
    return list;
  }, [items, sort]);

  // autocomplete fetch
  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 1) {
      setSuggestions([]);
      return;
    }

    try {
      setSugLoading(true);
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const res = await api.get("/api/search-players", {
        params: { q },
        signal: abortRef.current.signal,
      });

      const players = res.data?.players || [];
      setSuggestions(players);
      setSugOpen(true);
    } catch (e) {
      console.error("Search error:", e);
      if (e.name !== "AbortError") {
        setSuggestions([]);
        setSugOpen(true);
      }
    } finally {
      setSugLoading(false);
    }
  }, []);

  // debounce input
  useEffect(() => {
    const q = form.player_name.trim();
    const t = setTimeout(() => fetchSuggestions(q), 250);
    return () => clearTimeout(t);
  }, [form.player_name, fetchSuggestions]);

  const applySuggestion = (p) => {
    setForm((f) => ({
      ...f,
      player_name: p.name,
      card_id: String(p.card_id || ""),
      version: p.version || f.version,
    }));
    setSugOpen(false);
  };

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

  // close suggestions on click outside
  useEffect(() => {
    const onDoc = (e) => {
      if (!inputRef.current) return;
      if (!inputRef.current.parentElement?.contains(e.target)) setSugOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // JSX return (unchanged except curly quotes fixed)
  return (
    <div className="p-6 md:p-8">
      {/* Header, Table, Modal ... */}
    </div>
  );
}