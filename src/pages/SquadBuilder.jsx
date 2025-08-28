// src/pages/SquadBuilder.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Star, Trophy, DollarSign, Plus } from "lucide-react";
import Pitch from "../components/squad/Pitch";
import PlayerTile from "../components/squad/PlayerTile"; // if you still show it anywhere
import { FORMATIONS } from "../components/squad/formations";
import { computeChemistry } from "../components/squad/chemistry";
import { searchPlayers, enrichPlayer } from "../api/squadApi";
import { isValidForSlot } from "../utils/positions";
import "../styles/squad.css";

const cls = (...xs) => xs.filter(Boolean).join(" ");

// ---- Card (same as you already have; shortened for brevity) ----
function EnhancedPlayerCard({ player, slotPosition, onRemove, chem = 0, draggable, onDragStart }) {
  if (!player) return null;
  const outOfPosition = !isValidForSlot(slotPosition, player.positions);
  return (
    <div className="relative group">
      <div
        className={cls(
          "w-24 h-32 rounded-xl border overflow-hidden shadow-lg bg-gray-900/70",
          outOfPosition && "ring-2 ring-red-500/50"
        )}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        {player.image_url && (
          <img src={player.image_url} alt={player.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute top-1.5 left-1.5 bg-yellow-400 text-black text-xs font-black px-1.5 py-0.5 rounded-md">
          {player.rating}
        </div>
        <div className="absolute top-1.5 right-1.5 bg-white/95 text-black text-xs font-black px-1.5 py-0.5 rounded-md">
          {player.positions?.[0] || "—"}
        </div>
        <div
          className={cls(
            "absolute top-7 right-1.5 w-2.5 h-2.5 rounded-full border border-black/20",
            outOfPosition ? "bg-red-500" : chem >= 3 ? "bg-lime-400" : chem === 2 ? "bg-yellow-400" : chem === 1 ? "bg-orange-400" : "bg-gray-500"
          )}
          title={`Chemistry: ${chem}/3${outOfPosition ? " (Out of Position)" : ""}`}
        />
        <div className="absolute bottom-6 left-1.5 right-1.5 text-white text-xs font-bold truncate drop-shadow-lg">
          {player.name}
        </div>
        {typeof player.price === "number" && (
          <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
            <span className="text-yellow-200 text-xs font-semibold truncate">{player.price.toLocaleString()}</span>
          </div>
        )}
      </div>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}

function EnhancedEmptySlot({ position, onClick, isSelected }) {
  return (
    <div
      onClick={onClick}
      className={cls(
        "w-24 h-32 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition",
        isSelected ? "border-green-400 bg-green-400/10" : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/30"
      )}
      title={`Add ${position}`}
    >
      <div className={cls("text-sm font-bold", isSelected ? "text-green-400" : "text-gray-400")}>{position}</div>
      <Plus size={16} className={cls("ml-1", isSelected ? "text-green-400" : "text-gray-500")} />
    </div>
  );
}

// --- helpers: (optional rotation that preserves pos) ---
function rotateSlot(slot) {
  return { ...slot, x: slot.y, y: 100 - slot.x, pos: slot.pos };
}
function rotateFormationSlots(slots) {
  return (slots || []).map(rotateSlot);
}

const c = (n) => (typeof n === "number" ? `${n.toLocaleString()}c` : "—");

export default function SquadBuilder() {
  const [formationKey, setFormationKey] = useState("4-3-3");

  // If you want portrait orientation, keep rotateFormationSlots(FORMATIONS[formationKey])
  const baseSlots = useMemo(() => FORMATIONS[formationKey] || [], [formationKey]);

  // Defensive guard: ensure every slot has a pos
  const safeSlots = useMemo(
    () => baseSlots.map(s => s.pos ? s : ({ ...s, pos: String(s.key).replace(/[0-9]/g, "").toUpperCase() })),
    [baseSlots]
  );

  const [placed, setPlaced] = useState(() => Object.fromEntries(safeSlots.map(s => [s.key, null])));

  // Preserve players when formation changes
  useEffect(() => {
    setPlaced(prev => {
      const next = {};
      for (const s of safeSlots) next[s.key] = prev[s.key] || null;
      return next;
    });
  }, [safeSlots]);

  const { perPlayerChem, teamChem } = useMemo(
    () => computeChemistry(placed, safeSlots),
    [placed, safeSlots]
  );

  const avgRating = useMemo(() => {
    const ps = Object.values(placed).filter(Boolean);
    if (!ps.length) return 0;
    return Math.round(ps.reduce((a, p) => a + (p.rating || 0), 0) / ps.length);
  }, [placed]);

  const squadPrice = useMemo(
    () => Object.values(placed).filter(Boolean).reduce((a, p) => a + (p.price || 0), 0),
    [placed]
  );

  const playerCount = useMemo(() => Object.values(placed).filter(Boolean).length, [placed]);

  // --- search ---
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(null);
  const debounceRef = useRef();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!search.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const base = await searchPlayers(search);
      setResults(base);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  async function addPlayerToSlot(basePlayer, slotKey) {
    const full = await enrichPlayer(basePlayer);
    setPlaced(prev => ({ ...prev, [slotKey]: full }));
    setSearchOpen(null);
    setSearch("");
  }

  function handleDragStart(e, playerId) {
    e.dataTransfer.setData("text/plain", String(playerId));
  }
  function handleDrop(e, slotKey) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    const base = results.find(x => x.id === id) || null;
    if (!base) return;
    addPlayerToSlot(base, slotKey);
  }

  function clearSlot(slotKey) { setPlaced(prev => ({ ...prev, [slotKey]: null })); }
  function clearAll() {
    setPlaced(Object.fromEntries(safeSlots.map(s => [s.key, null])));
    setSearchOpen(null);
  }

  function shareUrl() {
    const pruned = Object.fromEntries(
      Object.entries(placed).map(([k, v]) => [
        k,
        v ? {
          id: v.id, name: v.name, rating: v.rating,
          club: v.club, nation: v.nation, league: v.league,
          positions: v.positions, image_url: v.image_url,
          price: v.price, isIcon: v.isIcon, isHero: v.isHero,
          clubId: v.clubId ?? null, nationId: v.nationId ?? null, leagueId: v.leagueId ?? null,
        } : null
      ])
    );
    const state = { formationKey, placed: pruned };
    const encoded = encodeURIComponent(btoa(JSON.stringify(state)));
    const url = new URL(window.location.href);
    url.searchParams.set("squad", encoded);
    navigator.clipboard.writeText(url.toString());
  }

  // Import from URL
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const encoded = url.searchParams.get("squad");
      if (!encoded) return;
      const state = JSON.parse(atob(decodeURIComponent(encoded)));
      if (state?.formationKey && FORMATIONS[state.formationKey]) setFormationKey(state.formationKey);
      if (state?.placed && typeof state.placed === "object") setPlaced(state.placed);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-2xl font-black"><span className="text-green-400">FUT</span> Squad Builder</div>
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              value={formationKey}
              onChange={(e) => setFormationKey(e.target.value)}
            >
              {Object.keys(FORMATIONS).map(k => (<option key={k} value={k}>{k}</option>))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 px-3 py-2 rounded-lg">
              <Star size={16} className="text-yellow-400" />
              <span className="font-semibold">{avgRating}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 px-3 py-2 rounded-lg">
              <Trophy size={16} className="text-blue-400" />
              <span className="font-semibold">{teamChem}/33</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 px-3 py-2 rounded-lg">
              <DollarSign size={16} className="text-green-400" />
              <span className="font-semibold">{c(squadPrice)}</span>
            </div>
            <button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold" onClick={shareUrl}>
              Share Link
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold" onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-[1400px] px-6 py-6 grid grid-cols-12 gap-6">
        {/* Pitch */}
        <div className="col-span-8">
          <Pitch height="620px">
            {safeSlots.map(slot => {
              const pl = placed[slot.key];
              const chem = pl ? (perPlayerChem[pl.id] ?? 0) : 0;
              return (
                <div
                  key={slot.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, slot.key)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                >
                  {pl ? (
                    <div className="relative group">
                      <EnhancedPlayerCard
                        player={pl}
                        slotPosition={slot.pos}
                        chem={chem}
                        draggable
                        onDragStart={(e) => handleDragStart(e, pl.id)}
                        onRemove={() => clearSlot(slot.key)}
                      />
                      <div className="absolute -bottom-8 left-0 right-0 opacity-0 group-hover:opacity-100 text-center text-xs">
                        <button className="px-2 py-1 bg-gray-800/90 rounded border border-gray-600 mr-2" onClick={() => setSearchOpen(slot.key)}>Swap</button>
                        <button className="px-2 py-1 bg-red-800/90 rounded border border-red-600" onClick={() => clearSlot(slot.key)}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <EnhancedEmptySlot position={slot.pos} isSelected={searchOpen === slot.key} onClick={() => setSearchOpen(slot.key)} />
                  )}
                </div>
              );
            })}
          </Pitch>

          <div className="mt-4 text-xs text-gray-400 flex gap-6">
            <span>💡 Tip: Click empty slots to add players. Drag to rearrange.</span>
            <span>🔴 Out of position = 0 chem</span>
            <span>🟢 Green dot = 3/3 chem</span>
          </div>
        </div>

        {/* Search & side panels (unchanged UI) */}
        <aside className="col-span-4 space-y-4">
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                  placeholder={searchOpen ? `Search for ${searchOpen}…` : "Search name, club, league, nation, position"}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {searchOpen && (
                <div className="mt-3 flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-300">Adding to: <span className="font-semibold text-green-400">{searchOpen}</span></span>
                  <button onClick={() => { setSearchOpen(null); setSearch(""); }} className="text-gray-400 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {results.length ? results.map((p) => {
                const slotPos = searchOpen ? safeSlots.find(s => s.key === searchOpen)?.pos : null;
                const validForSlot = slotPos ? isValidForSlot(slotPos, p.positions) : true;
                return (
                  <div
                    key={p.id}
                    className={cls(
                      "bg-gray-800 border border-gray-700 rounded-xl p-3 flex items-center gap-3",
                      searchOpen && validForSlot ? "hover:bg-gray-700 cursor-pointer" : searchOpen ? "opacity-60" : ""
                    )}
                    onClick={() => searchOpen && validForSlot && addPlayerToSlot(p, searchOpen)}
                  >
                    <EnhancedPlayerCard player={p} slotPosition={slotPos || p.positions?.[0]} draggable onDragStart={(e) => handleDragStart(e, p.id)} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{p.name}</div>
                      <div className="text-xs text-gray-400 truncate">{p.club || "—"} • {p.nation || "—"}</div>
                      <div className="text-xs text-gray-300">⭐ {p.rating ?? "-"} • {typeof p.price === "number" ? p.price.toLocaleString() : "—"}c</div>
                      {searchOpen && !validForSlot && <div className="text-xs text-red-400 mt-1">❌ Cannot play {slotPos}</div>}
                    </div>
                    {searchOpen && (
                      <button
                        className={cls(
                          "px-3 py-1.5 rounded-lg text-xs font-bold",
                          validForSlot ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-600 text-gray-300 cursor-not-allowed"
                        )}
                        disabled={!validForSlot}
                        onClick={(e) => { e.stopPropagation(); validForSlot && addPlayerToSlot(p, searchOpen); }}
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              }) : (
                <div className="py-10 text-center text-gray-400">Start typing to search players…</div>
              )}
            </div>
          </div>

          {/* small overview box omitted for brevity */}
        </aside>
      </main>
    </div>
  );
}