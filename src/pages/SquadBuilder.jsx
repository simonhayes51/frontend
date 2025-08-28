// src/pages/SquadBuilder.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Star, Users, Trophy, DollarSign, Plus } from "lucide-react";
import Pitch from "../components/squad/Pitch";
import { FORMATIONS } from "../components/squad/formations";
import { VERTICAL_COORDS } from "../components/squad/formations_vertical";
import { computeChemistry } from "../components/squad/chemistry";
import { searchPlayers, enrichPlayer } from "../api/squadApi";
import { isValidForSlot } from "../utils/positions";
import "../styles/squad.css";

const cls = (...xs) => xs.filter(Boolean).join(" ");

// FUT-like compact card
function Card({ player, slotPosition, chem = 0, size = "md", onRemove, draggable, onDragStart }) {
  if (!player) return null;
  const outOfPos = !isValidForSlot(slotPosition, player.positions);
  const sizeClasses = size === "sm" ? "w-16 h-20" : "w-24 h-32";
  return (
    <div className="relative group">
      <div
        className={`${sizeClasses} rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden shadow hover:shadow-lg transition-all`}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        {player.image_url && (
          <img className="absolute inset-0 w-full h-full object-cover" src={player.image_url} alt={player.name} referrerPolicy="no-referrer" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/0 pointer-events-none" />
        <div className="absolute top-1.5 left-1.5 bg-yellow-400 text-black text-xs font-black px-1.5 py-0.5 rounded">{player.rating ?? "-"}</div>
        <div className="absolute top-1.5 right-1.5 bg-white/95 text-black text-xs font-black px-1.5 py-0.5 rounded">{player.positions?.[0] || "—"}</div>
        <div
          className={`absolute top-7 right-1.5 w-2.5 h-2.5 rounded-full border border-black/30 ${
            outOfPos ? "bg-red-500" : chem >= 3 ? "bg-lime-400" : chem === 2 ? "bg-yellow-400" : chem === 1 ? "bg-orange-400" : "bg-gray-500"
          }`}
          title={outOfPos ? "Out of position (0)" : `Chemistry: ${chem}/3`}
        />
        <div className="absolute bottom-6 left-1.5 right-1.5 text-white text-xs font-bold truncate drop-shadow">{player.name}</div>
        {typeof player.price === "number" && (
          <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
            <span className="text-yellow-200 text-xs font-semibold truncate">{player.price.toLocaleString()}</span>
          </div>
        )}
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
            title="Remove"
          >
            <X size={10} />
          </button>
        )}
      </div>
      {outOfPos && (
        <div className="absolute -bottom-5 left-0 right-0 text-center">
          <span className="text-xs text-red-400 bg-red-900/70 px-2 py-0.5 rounded-full border border-red-600/40">OOP</span>
        </div>
      )}
    </div>
  );
}

function EmptySlot({ position, onClick, isSelected }) {
  return (
    <div
      onClick={onClick}
      className={`w-24 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
        isSelected ? "border-green-400 bg-green-400/10" : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/30"
      }`}
      title={`Add ${position}`}
    >
      <div className={`text-sm font-bold ${isSelected ? "text-green-400" : "text-gray-400"}`}>{position}</div>
      <Plus size={16} className={`${isSelected ? "text-green-400" : "text-gray-500"}`} />
    </div>
  );
}

function rotateSlot(s) { return { ...s, x: s.y, y: 100 - s.x }; }
function rotateFormationSlots(slots) { return (slots || []).map(rotateSlot); }
function getVerticalSlots(key) { return VERTICAL_COORDS[key] || rotateFormationSlots(FORMATIONS[key] || []); }
const fmtCoins = (n) => (typeof n === "number" ? `${n.toLocaleString()}c` : "—");

export default function SquadBuilder() {
  const [formationKey, setFormationKey] = useState("4-3-3");
  const slots = useMemo(() => getVerticalSlots(formationKey), [formationKey]);

  const [placed, setPlaced] = useState(() => Object.fromEntries(slots.map((s) => [s.key, null])));
  useEffect(() => {
    setPlaced((prev) => {
      const next = {};
      for (const s of slots) next[s.key] = prev[s.key] || null;
      return next;
    });
  }, [slots, formationKey]);

  const { perPlayerChem, teamChem } = useMemo(() => computeChemistry(placed, slots), [placed, slots]);

  const avgRating = useMemo(() => {
    const ps = Object.values(placed).filter(Boolean);
    return ps.length ? Math.round(ps.reduce((a, p) => a + (p.rating || 0), 0) / ps.length) : 0;
  }, [placed]);

  const squadPrice = useMemo(
    () => Object.values(placed).filter(Boolean).reduce((a, p) => a + (p.price || 0), 0),
    [placed]
  );
  const playerCount = useMemo(() => Object.values(placed).filter(Boolean).length, [placed]);

  // search
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

  // place immediately (DB data → chemistry works), then enrich and merge
  async function addPlayerToSlot(basePlayer, slotKey) {
    setPlaced((prev) => ({ ...prev, [slotKey]: basePlayer }));
    setSearchOpen(null);
    setSearch("");
    try {
      const full = await enrichPlayer(basePlayer);
      setPlaced((prev) => {
        const cur = prev[slotKey];
        if (!cur || cur.id !== basePlayer.id) return prev;
        return { ...prev, [slotKey]: { ...cur, ...full } };
      });
    } catch {}
  }

  function handleDragStart(e, playerId) { e.dataTransfer.setData("text/plain", String(playerId)); }
  function handleDrop(e, slotKey) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    const base = results.find((x) => x.id === id);
    if (base) addPlayerToSlot(base, slotKey);
  }
  function clearSlot(slotKey) { setPlaced((prev) => ({ ...prev, [slotKey]: null })); }
  function clearAll() { setPlaced(Object.fromEntries(slots.map((s) => [s.key, null]))); setSearchOpen(null); }

  function shareUrl() {
    const pruned = Object.fromEntries(Object.entries(placed).map(([k, v]) => [
      k, v ? {
        id: v.id, name: v.name, rating: v.rating,
        club: v.club, nation: v.nation, league: v.league,
        clubId: v.clubId, nationId: v.nationId, leagueId: v.leagueId,
        positions: v.positions, image_url: v.image_url, price: v.price, isIcon: v.isIcon, isHero: v.isHero,
      } : null
    ]));
    const state = { formationKey, placed: pruned };
    const encoded = encodeURIComponent(btoa(JSON.stringify(state)));
    const url = new URL(window.location.href);
    url.searchParams.set("squad", encoded);
    navigator.clipboard.writeText(url.toString());
  }

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const encoded = url.searchParams.get("squad");
      if (!encoded) return;
      const state = JSON.parse(atob(decodeURIComponent(encoded)));
      if (state?.formationKey && (VERTICAL_COORDS[state.formationKey] || FORMATIONS[state.formationKey])) {
        setFormationKey(state.formationKey);
      }
      if (state?.placed && typeof state.placed === "object") setPlaced(state.placed);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-2xl font-black tracking-tight">
              <span className="text-green-400">FUT</span> Squad Builder
            </div>
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
              value={formationKey}
              onChange={(e) => setFormationKey(e.target.value)}
            >
              {Object.keys({ ...VERTICAL_COORDS, ...FORMATIONS }).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
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
              <span className="font-semibold">{fmtCoins(squadPrice)}</span>
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

      <main className="mx-auto max-w-[1400px] px-6 py-6 grid grid-cols-12 gap-6">
        {/* Pitch */}
        <div className="col-span-8">
          <Pitch height="600px">
            {slots.map((slot) => {
              const pl = placed[slot.key];
              const chem = pl ? perPlayerChem[pl.id] ?? 0 : 0;
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
                      <Card
                        player={pl}
                        slotPosition={slot.pos}
                        chem={chem}
                        draggable
                        onDragStart={(e) => handleDragStart(e, pl.id)}
                        onRemove={() => clearSlot(slot.key)}
                      />
                      <div className="absolute -bottom-8 left-0 right-0 opacity-0 group-hover:opacity-100 transition">
                        <div className="flex justify-center gap-2 text-xs">
                          <button className="bg-gray-800/90 hover:bg-gray-700 text-white px-2 py-1 rounded border border-gray-600" onClick={() => setSearchOpen(slot.key)}>
                            Swap
                          </button>
                          <button className="bg-red-800/90 hover:bg-red-700 text-white px-2 py-1 rounded border border-red-600" onClick={() => clearSlot(slot.key)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptySlot position={slot.pos} isSelected={searchOpen === slot.key} onClick={() => setSearchOpen(slot.key)} />
                  )}
                </div>
              );
            })}
          </Pitch>

          <div className="mt-6 flex items-center gap-6 text-xs text-gray-400">
            <span>💡 Tip: Click empty slots to add players, drag to rearrange</span>
            <span>🔴 Red dot: Out of position (0 chem)</span>
            <span>🟢 Green: 3/3 chem</span>
          </div>
        </div>

        {/* Search */}
        <aside className="col-span-4 space-y-4">
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  placeholder={searchOpen ? `Search for ${searchOpen}...` : "Search name, club, league, nation, position"}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {searchOpen && (
                <div className="mt-3 flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-300">
                    Adding to: <span className="font-semibold text-green-400">{searchOpen}</span>
                  </span>
                  <button onClick={() => { setSearchOpen(null); setSearch(""); }} className="text-gray-400 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {results.length > 0 ? (
                <div className="p-3 space-y-2">
                  {results.map((p) => {
                    const slotPos = searchOpen ? slots.find((s) => s.key === searchOpen)?.pos : null;
                    const validForSlot = slotPos ? isValidForSlot(slotPos, p.positions) : true;
                    return (
                      <div
                        key={p.id}
                        onClick={() => searchOpen && validForSlot && addPlayerToSlot(p, searchOpen)}
                        className={`bg-gray-800 border border-gray-700 rounded-xl p-3 transition ${
                          searchOpen && validForSlot ? "hover:bg-gray-700 cursor-pointer hover:border-gray-600" :
                          searchOpen ? "opacity-50 cursor-not-allowed" : "cursor-default"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Card player={p} size="sm" draggable onDragStart={(e) => handleDragStart(e, p.id)} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate">{p.name}</span>
                              {p.isIcon && <span className="text-xs bg-orange-500/80 text-white px-1.5 py-0.5 rounded font-bold">ICON</span>}
                              {p.isHero && <span className="text-xs bg-purple-500/80 text-white px-1.5 py-0.5 rounded font-bold">HERO</span>}
                            </div>
                            <div className="text-xs text-gray-400 truncate">{p.club || "—"} • {p.nation || "—"}</div>
                            <div className="text-xs flex items-center gap-2">
                              <span className="text-white font-medium">⭐ {p.rating ?? "-"}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-green-400 font-medium">{fmtCoins(p.price)}</span>
                            </div>
                            {!validForSlot && searchOpen && <div className="text-xs text-red-400 mt-1">❌ Cannot play {slotPos}</div>}
                          </div>
                          {searchOpen && (
                            <button
                              onClick={(e) => { e.stopPropagation(); validForSlot && addPlayerToSlot(p, searchOpen); }}
                              disabled={!validForSlot}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                validForSlot ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-600 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : search ? (
                <div className="p-8 text-center text-gray-400">
                  <Search size={32} className="mx-auto mb-3 opacity-50" />
                  <div className="text-sm">No players found for “{search}”</div>
                  <div className="text-xs text-gray-500 mt-1">Try a different term</div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Users size={32} className="mx-auto mb-3 opacity-50" />
                  <div className="text-sm">Start typing to search players…</div>
                  {searchOpen && <div className="text-xs mt-2 text-green-400">Looking for {searchOpen} players</div>}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar summary */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Users size={16} className="text-blue-400" /> Squad Overview
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-xs">Squad Completion</span>
                  <span className="font-bold text-sm">{playerCount}/11</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all" style={{ width: `${(playerCount / 11) * 100}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-yellow-400 font-bold text-xl">{avgRating}</div>
                  <div className="text-gray-400 text-xs">Avg Rating</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-green-400 font-bold text-xl">{teamChem}</div>
                  <div className="text-gray-400 text-xs">Team Chemistry</div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-blue-400 font-bold text-lg">{squadPrice.toLocaleString()}</div>
                <div className="text-gray-400 text-xs">Total Squad Value (coins)</div>
              </div>
            </div>
          </div>

          {/* Chemistry rules */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Trophy size={16} className="text-green-400" /> Chemistry Rules (FC25)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-800 rounded-lg p-2 text-center">
                <div className="text-blue-400 font-semibold text-xs">Club</div>
                <div className="text-gray-400 text-xs mt-1">2/4/7 → +1/+2/+3</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-2 text-center">
                <div className="text-green-400 font-semibold text-xs">Nation</div>
                <div className="text-gray-400 text-xs mt-1">2/5/8 → +1/+2/+3</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-2 text-center">
                <div className="text-purple-400 font-semibold text-xs">League</div>
                <div className="text-gray-400 text-xs mt-1">3/5/8 → +1/+2/+3</div>
              </div>
            </div>
            <div className="text-gray-400 text-xs mt-3 border-t border-gray-800 pt-3 space-y-1">
              <div>ICON: 3 chem in position, boosts nation</div>
              <div>HERO: 3 chem in position, boosts league</div>
              <div>OOP: 0 chem and no contributions</div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}