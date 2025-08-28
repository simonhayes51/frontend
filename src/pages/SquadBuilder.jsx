// src/pages/SquadBuilder.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Star, Users, Trophy, DollarSign, Plus } from "lucide-react";
import Pitch from "../components/squad/Pitch";
import PlayerTile from "../components/squad/PlayerTile";
import { FORMATIONS } from "../components/squad/formations";
import { VERTICAL_COORDS } from "../components/squad/formations_vertical";
import { computeChemistry } from "../components/squad/chemistry";
import { searchPlayers, enrichPlayer } from "../api/squadApi";
import { isValidForSlot } from "../utils/positions";
import "../styles/squad.css";

const cls = (...xs) => xs.filter(Boolean).join(" ");

// Enhanced player card component matching FUT.GG style
function EnhancedPlayerCard({ 
  player, 
  slotPosition, 
  onRemove, 
  chem = 0, 
  size = "md",
  draggable = false,
  onDragStart 
}) {
  if (!player) return null;

  const outOfPosition = !isValidForSlot(slotPosition, player.positions);
  
  // Card styling based on player type
  const getCardStyle = () => {
    if (player.isIcon) return "from-orange-500/40 via-yellow-500/40 to-orange-600/40 border-orange-500/50";
    if (player.isHero) return "from-purple-500/40 via-pink-500/40 to-purple-600/40 border-purple-500/50";
    return "from-blue-500/30 via-purple-500/30 to-pink-500/30 border-gray-600";
  };

  const sizeClasses = size === "sm" ? "w-16 h-20" : "w-24 h-32";

  return (
    <div className="relative group">
      <div 
        className={`${sizeClasses} bg-gradient-to-br ${getCardStyle()} rounded-xl border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 ${outOfPosition ? 'ring-2 ring-red-500/50' : ''}`}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        {/* Player image if available */}
        {player.image_url && (
          <img 
            className="absolute inset-0 w-full h-full object-cover" 
            src={player.image_url} 
            alt={player.name}
            referrerPolicy="no-referrer"
          />
        )}
        
        {/* Card frame overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        
        {/* Rating badge */}
        <div className="absolute top-1.5 left-1.5 bg-yellow-400 text-black text-xs font-black px-1.5 py-0.5 rounded-md shadow-sm">
          {player.rating}
        </div>
        
        {/* Position badge */}
        <div className="absolute top-1.5 right-1.5 bg-white/95 text-black text-xs font-black px-1.5 py-0.5 rounded-md shadow-sm">
          {player.positions?.[0] || "—"}
        </div>

        {/* Chemistry indicator */}
        <div className={`absolute top-7 right-1.5 w-2.5 h-2.5 rounded-full shadow-sm border border-black/20 ${
          outOfPosition ? 'bg-red-500' :
          chem >= 3 ? 'bg-lime-400' : 
          chem === 2 ? 'bg-yellow-400' : 
          chem === 1 ? 'bg-orange-400' : 
          'bg-gray-500'
        }`} title={`Chemistry: ${chem}/3${outOfPosition ? ' (Out of Position)' : ''}`} />

        {/* Special card type badges */}
        {player.isIcon && (
          <div className="absolute top-10 left-1 bg-orange-500 text-white text-xs font-bold px-1 py-0.5 rounded text-center">
            ICN
          </div>
        )}
        {player.isHero && (
          <div className="absolute top-10 left-1 bg-purple-500 text-white text-xs font-bold px-1 py-0.5 rounded text-center">
            HRO
          </div>
        )}

        {/* Player name */}
        <div className="absolute bottom-6 left-1.5 right-1.5">
          <div className="text-white text-xs font-bold truncate drop-shadow-lg">
            {player.name}
          </div>
        </div>

        {/* Price */}
        {typeof player.price === "number" && (
          <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-sm" />
            <span className="text-yellow-200 text-xs font-semibold truncate">
              {player.price.toLocaleString()}
            </span>
          </div>
        )}

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600 shadow-lg z-10"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Out of position warning */}
      {outOfPosition && (
        <div className="absolute -bottom-5 left-0 right-0 text-center">
          <span className="text-xs text-red-400 bg-red-900/80 px-2 py-0.5 rounded-full border border-red-500/50 shadow-sm">
            OOP
          </span>
        </div>
      )}
    </div>
  );
}

function EnhancedEmptySlot({ position, onClick, isSelected }) {
  return (
    <div 
      onClick={onClick}
      className={`w-24 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${
        isSelected 
          ? 'border-green-400 bg-green-400/10 shadow-lg shadow-green-400/20' 
          : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/30'
      }`}
    >
      <div className={`text-sm font-bold transition-colors ${
        isSelected ? 'text-green-400' : 'text-gray-400 group-hover:text-gray-300'
      }`}>
        {position}
      </div>
      <Plus size={16} className={`mt-1 transition-colors ${
        isSelected ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-400'
      }`} />
      {isSelected && (
        <div className="text-xs text-green-400 mt-1 font-medium animate-pulse">
          Click player
        </div>
      )}
    </div>
  );
}

// helpers
function rotateSlot(slot) {
  return { ...slot, x: slot.y, y: 100 - slot.x };
}
function rotateFormationSlots(slots) {
  return (slots || []).map(rotateSlot);
}
function getVerticalSlots(formationKey) {
  return VERTICAL_COORDS[formationKey] || rotateFormationSlots(FORMATIONS[formationKey] || []);
}

const c = (n) => (typeof n === "number" ? `${n.toLocaleString()}c` : "—");

export default function SquadBuilder() {
  const [formationKey, setFormationKey] = useState("4-3-3");
  const slots = useMemo(() => getVerticalSlots(formationKey), [formationKey]);

  const [placed, setPlaced] = useState(() => Object.fromEntries(slots.map((s) => [s.key, null])));

  // When formation changes, preserve players in matching slots
  useEffect(() => {
    setPlaced((prev) => {
      const next = {};
      for (const s of slots) next[s.key] = prev[s.key] || null;
      return next;
    });
  }, [formationKey, slots]);

  const { perPlayerChem, teamChem } = useMemo(
    () => computeChemistry(placed, slots),
    [placed, slots]
  );

  const avgRating = useMemo(() => {
    const ps = Object.values(placed).filter(Boolean);
    if (ps.length === 0) return 0;
    return Math.round(ps.reduce((a, p) => a + (p.rating || 0), 0) / ps.length);
  }, [placed]);

  const squadPrice = useMemo(() => {
    return Object.values(placed)
      .filter(Boolean)
      .reduce((a, p) => a + (p.price || 0), 0);
  }, [placed]);

  const playerCount = useMemo(() => {
    return Object.values(placed).filter(Boolean).length;
  }, [placed]);

  // search
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(null);
  const debounceRef = useRef();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!search.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const base = await searchPlayers(search);
      setResults(base);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  async function addPlayerToSlot(basePlayer, slotKey) {
    const full = await enrichPlayer(basePlayer);
    setPlaced((prev) => ({ ...prev, [slotKey]: full }));
    setSearchOpen(null);
    setSearch("");
  }

  // DnD
  function handleDragStart(e, playerId) {
    e.dataTransfer.setData("text/plain", String(playerId));
  }

  function handleDrop(e, slotKey) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    const base = results.find((x) => x.id === id) || null;
    if (!base) return;
    addPlayerToSlot(base, slotKey);
  }

  function clearSlot(slotKey) {
    setPlaced((prev) => ({ ...prev, [slotKey]: null }));
  }

  function clearAll() {
    setPlaced(Object.fromEntries(slots.map((s) => [s.key, null])));
    setSearchOpen(null);
  }

  // shareable state
  function shareUrl() {
    const pruned = Object.fromEntries(
      Object.entries(placed).map(([k, v]) => [
        k,
        v ? {
          id: v.id,
          name: v.name,
          rating: v.rating,
          club: v.club,
          nation: v.nation,
          league: v.league,
          positions: v.positions,
          image_url: v.image_url,
          price: v.price,
          isIcon: v.isIcon,
          isHero: v.isHero,
        } : null,
      ])
    );
    const state = { formationKey, placed: pruned };
    const encoded = encodeURIComponent(btoa(JSON.stringify(state)));
    const url = new URL(window.location.href);
    url.searchParams.set("squad", encoded);
    navigator.clipboard.writeText(url.toString());
  };

  // Import squad from URL
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const encoded = url.searchParams.get("squad");
      if (!encoded) return;
      const state = JSON.parse(atob(decodeURIComponent(encoded)));
      if (state?.formationKey && (VERTICAL_COORDS[state.formationKey] || FORMATIONS[state.formationKey])) {
        setFormationKey(state.formationKey);
      }
      if (state?.placed && typeof state.placed === "object") {
        setPlaced(state.placed);
      }
    } catch {
      // ignore import errors
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Enhanced Header */}
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
              <span className="font-semibold">{c(squadPrice)}</span>
            </div>
            <button
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition-colors"
              onClick={shareUrl}
              title="Copy shareable link to clipboard"
            >
              Share Link
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold transition-colors"
              onClick={clearAll}
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Body: Pitch + Search */}
      <main className="mx-auto max-w-[1400px] px-6 py-6 grid grid-cols-12 gap-6">
        {/* Pitch */}
        <div className="col-span-8">
          <Pitch height="600px">
            {slots.map((slot) => {
              const pl = placed[slot.key];
              const chem = pl ? perPlayerChem[pl.id] ?? 0 : 0;
              const outOfPos = pl ? !isValidForSlot(slot.pos, pl.positions) : false;

              return (
                <div
                  key={slot.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, slot.key)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                  }}
                >
                  {pl ? (
                    <div className="relative">
                      <EnhancedPlayerCard
                        player={pl}
                        slotPosition={slot.pos}
                        chem={chem}
                        draggable
                        onDragStart={(e) => handleDragStart(e, pl.id)}
                        onRemove={() => clearSlot(slot.key)}
                      />
                      
                      {/* Slot actions */}
                      <div className="absolute -bottom-8 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex justify-center gap-2 text-xs">
                          <button
                            className="bg-gray-800/90 hover:bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 transition-colors"
                            onClick={() => setSearchOpen(slot.key)}
                          >
                            Swap
                          </button>
                          <button
                            className="bg-red-800/90 hover:bg-red-700 text-white px-2 py-1 rounded border border-red-600 transition-colors"
                            onClick={() => clearSlot(slot.key)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EnhancedEmptySlot
                      position={slot.pos}
                      isSelected={searchOpen === slot.key}
                      onClick={() => setSearchOpen(slot.key)}
                    />
                  )}
                </div>
              );
            })}
          </Pitch>

          <div className="mt-6 flex items-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-2">
              💡 <strong>Tip:</strong> Click empty slots to add players, drag to rearrange
            </span>
            <span className="flex items-center gap-2">
              🔴 <strong>Red dot:</strong> Out of position (0 chemistry)
            </span>
            <span className="flex items-center gap-2">
              🟢 <strong>Green dot:</strong> Full chemistry (3/3)
            </span>
          </div>
        </div>

        {/* Enhanced Search panel */}
        <aside className="col-span-4 space-y-4">
          {/* Search */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  placeholder={
                    searchOpen ? `Search for ${searchOpen}...` : "Search name, club, league, nation, position"
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              {searchOpen && (
                <div className="mt-3 flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-300">
                    Adding to: <span className="font-semibold text-green-400">{searchOpen}</span>
                  </span>
                  <button
                    onClick={() => {
                      setSearchOpen(null);
                      setSearch("");
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {results.length > 0 ? (
                <div className="p-3 space-y-2">
                  {results.map((p) => {
                    const slotPos = searchOpen ? slots.find(s => s.key === searchOpen)?.pos : null;
                    const validForSlot = slotPos ? isValidForSlot(slotPos, p.positions) : true;
                    
                    return (
                      <div
                        key={p.id}
                        onClick={() => searchOpen && addPlayerToSlot(p, searchOpen)}
                        className={`bg-gray-800 border border-gray-700 rounded-xl p-3 transition-all duration-200 ${
                          searchOpen && validForSlot ? 'hover:bg-gray-700 cursor-pointer hover:border-gray-600' : 
                          searchOpen && !validForSlot ? 'opacity-50 cursor-not-allowed' :
                          'cursor-default'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <EnhancedPlayerCard player={p} size="sm" draggable onDragStart={(e) => handleDragStart(e, p.id)} />
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate">{p.name}</span>
                              {p.isIcon && <span className="text-xs bg-orange-500/80 text-white px-1.5 py-0.5 rounded font-bold">ICON</span>}
                              {p.isHero && <span className="text-xs bg-purple-500/80 text-white px-1.5 py-0.5 rounded font-bold">HERO</span>}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {p.club || "—"} • {p.nation || "—"}
                            </div>
                            <div className="text-xs flex items-center gap-2">
                              <span className="text-white font-medium">⭐ {p.rating ?? "-"}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-green-400 font-medium">{c(p.price)}</span>
                            </div>
                            {!validForSlot && searchOpen && (
                              <div className="text-xs text-red-400 mt-1">❌ Cannot play {slotPos}</div>
                            )}
                          </div>

                          {searchOpen && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addPlayerToSlot(p, searchOpen);
                              }}
                              disabled={!validForSlot}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                validForSlot 
                                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm' 
                                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
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
                  <div className="text-sm">No players found for "{search}"</div>
                  <div className="text-xs text-gray-500 mt-1">Try a different search term</div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Users size={32} className="mx-auto mb-3 opacity-50" />
                  <div className="text-sm">Start typing to search players...</div>
                  {searchOpen && (
                    <div className="text-xs mt-2 text-green-400">Looking for {searchOpen} players</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Squad Progress */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Squad Overview
            </h3>
            <div className="space-y-3">
              {/* Squad completion */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-xs">Squad Completion</span>
                  <span className="font-bold text-sm">{playerCount}/11</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(playerCount / 11) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Key stats grid */}
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

          {/* Chemistry Rules */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Trophy size={16} className="text-green-400" />
              Chemistry Rules (FC25-style)
            </h3>
            <div className="space-y-3">
              {/* Chemistry sources grid */}
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

              {/* Special cards info */}
              <div className="text-gray-400 text-xs space-y-1 border-t border-gray-800 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-orange-500/80 text-white px-1.5 py-0.5 rounded font-bold">ICON</span>
                  <span>3 chem in position, boost nation globally</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-purple-500/80 text-white px-1.5 py-0.5 rounded font-bold">HERO</span>
                  <span>3 chem in position, boost their league</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-red-500/80 text-white px-1.5 py-0.5 rounded font-bold">OOP</span>
                  <span>Out of position → 0 chem, no contributions</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
