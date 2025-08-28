// src/pages/SquadBuilder.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Star, Trophy, DollarSign, Users, Plus } from "lucide-react";
import Pitch from "../components/squad/Pitch";
import { FORMATIONS } from "../components/squad/formations";
import { VERTICAL_COORDS } from "../components/squad/formations_vertical";
import { computeChemistry } from "../components/squad/chemistry";
import { searchPlayers, enrichPlayer } from "../api/squadApi";
import { isValidForSlot } from "../utils/positions";
import "../styles/squad.css";

const cls = (...xs) => xs.filter(Boolean).join(" ");
const coins = (n) => (typeof n === "number" ? `${n.toLocaleString()}c` : "—");

function EmptySlot({ pos, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "w-24 h-32 rounded-xl border-2 border-dashed grid place-items-center transition",
        selected
          ? "border-green-400 bg-green-500/10 shadow-[0_0_0_2px_rgba(34,197,94,.2)]"
          : "border-white/30 hover:border-white/50 hover:bg-white/5"
      )}
      title={`Add ${pos}`}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-bold">{pos}</span>
        <Plus size={16} className={selected ? "text-green-400" : "text-white/60"} />
      </div>
    </button>
  );
}

function PlayerCard({ player, slotPos, chem = 0, onRemove, draggable, onDragStart }) {
  const oop = !isValidForSlot(slotPos, player.positions);
  return (
    <div className="relative group">
      <div
        className={cls(
          "w-24 h-32 rounded-xl overflow-hidden border shadow transition",
          oop ? "ring-2 ring-red-500/60" : "",
          "bg-gradient-to-br from-slate-700/60 via-slate-900/60 to-black border-slate-600"
        )}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        {player.image_url && (
          <img
            src={player.image_url}
            alt={player.name}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}

        {/* overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/30 pointer-events-none" />

        {/* rating & pos */}
        <div className="absolute top-1 left-1 bg-yellow-400 text-black text-xs font-black px-1.5 rounded">
          {player.rating ?? "-"}
        </div>
        <div className="absolute top-1 right-1 bg-white text-black text-[10px] font-black px-1.5 rounded">
          {player.positions?.[0] ?? "—"}
        </div>

        {/* chem dot */}
        <div
          className={cls(
            "absolute top-6 right-1 w-2.5 h-2.5 rounded-full border border-black/30",
            oop
              ? "bg-red-500"
              : chem >= 3
              ? "bg-lime-400"
              : chem === 2
              ? "bg-yellow-400"
              : chem === 1
              ? "bg-orange-400"
              : "bg-gray-500"
          )}
          title={`Chemistry: ${chem}/3${oop ? " (Out of Position)" : ""}`}
        />

        {/* name */}
        <div className="absolute bottom-6 left-1 right-1">
          <div className="text-white text-xs font-bold truncate drop-shadow">
            {player.name}
          </div>
        </div>

        {/* price */}
        {typeof player.price === "number" && (
          <div className="absolute bottom-1 left-1 right-1 text-[11px] text-yellow-200 font-semibold truncate">
            {player.price.toLocaleString()}
          </div>
        )}

        {/* remove */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition"
            title="Remove"
          >
            <X size={10} />
          </button>
        )}
      </div>
      {oop && (
        <div className="absolute -bottom-5 left-0 right-0 text-center">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/70 text-red-300 border border-red-600/40">
            Out of position
          </span>
        </div>
      )}
    </div>
  );
}

// helpers for vertical pitch coords
const rotate = (slot) => ({ ...slot, x: slot.y, y: 100 - slot.x });
const rotateSlots = (slots) => (slots || []).map(rotate);
const getVerticalSlots = (k) => VERTICAL_COORDS[k] || rotateSlots(FORMATIONS[k] || []);

export default function SquadBuilder() {
  const [formationKey, setFormationKey] = useState("4-3-3");
  const slots = useMemo(() => getVerticalSlots(formationKey), [formationKey]);

  // placed players keyed by slot
  const [placed, setPlaced] = useState(() => Object.fromEntries(slots.map((s) => [s.key, null])));

  // keep players when formation changes for same slot keys
  useEffect(() => {
    setPlaced((prev) => {
      const next = {};
      for (const s of slots) next[s.key] = prev[s.key] || null;
      return next;
    });
  }, [formationKey, slots]);

  // chemistry
  const { perPlayerChem, teamChem } = useMemo(
    () => computeChemistry(placed, slots),
    [placed, slots]
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

  // search state
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(null);
  const debounceRef = useRef();

  // run search with slot filtering (so clicking ST shows ST-eligible players)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const slotPos = searchOpen ? slots.find((s) => s.key === searchOpen)?.pos : null;

    if (!search.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const base = await searchPlayers(search, slotPos);
      setResults(base);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, searchOpen, slots]);

  async function addToSlot(basePlayer, slotKey) {
    const full = await enrichPlayer(basePlayer);
    setPlaced((prev) => ({ ...prev, [slotKey]: full }));
    setSearch("");
    setSearchOpen(null);
  }

  // DnD
  function onDragStart(e, playerId) {
    e.dataTransfer.setData("text/plain", String(playerId));
  }
  function onDrop(e, slotKey) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    const p = results.find((x) => x.id === id) || null;
    if (!p) return;
    addToSlot(p, slotKey);
  }

  function clearSlot(key) {
    setPlaced((prev) => ({ ...prev, [key]: null }));
  }
  function clearAll() {
    setPlaced(Object.fromEntries(slots.map((s) => [s.key, null])));
    setSearch("");
    setSearchOpen(null);
  }

  // share
  function share() {
    const slim = Object.fromEntries(
      Object.entries(placed).map(([k, v]) => [
        k,
        v
          ? {
              id: v.id,
              name: v.name,
              rating: v.rating,
              club: v.club,
              nation: v.nation,
              league: v.league,
              positions: v.positions,
              image_url: v.image_url,
              price: v.price,
            }
          : null,
      ])
    );
    const state = { formationKey, placed: slim };
    const encoded = encodeURIComponent(btoa(JSON.stringify(state)));
    const url = new URL(window.location.href);
    url.searchParams.set("squad", encoded);
    navigator.clipboard.writeText(url.toString());
  }

  // import from URL
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const enc = url.searchParams.get("squad");
      if (!enc) return;
      const state = JSON.parse(atob(decodeURIComponent(enc)));
      if (state?.formationKey && (VERTICAL_COORDS[state.formationKey] || FORMATIONS[state.formationKey])) {
        setFormationKey(state.formationKey);
      }
      if (state?.placed && typeof state.placed === "object") {
        setPlaced(state.placed);
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-2xl font-black tracking-tight">
              <span className="text-green-400">FUT</span> Squad Builder
            </div>
            <select
              className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={formationKey}
              onChange={(e) => setFormationKey(e.target.value)}
            >
              {Object.keys({ ...VERTICAL_COORDS, ...FORMATIONS }).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 px-3 py-2 rounded-lg">
              <Star size={16} className="text-yellow-400" />
              <span className="font-semibold">{avgRating}</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 px-3 py-2 rounded-lg">
              <Trophy size={16} className="text-blue-400" />
              <span className="font-semibold">{teamChem}/33</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 px-3 py-2 rounded-lg">
              <DollarSign size={16} className="text-green-400" />
              <span className="font-semibold">{coins(squadPrice)}</span>
            </div>
            <button onClick={share} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold">
              Share Link
            </button>
            <button onClick={clearAll} className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg font-semibold">
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-[1400px] px-6 py-6 grid grid-cols-12 gap-6">
        {/* Pitch */}
        <div className="col-span-8">
          {/* You already have Pitch rendering the turf/markings; we just position slots */}
          <Pitch height="600px">
            {slots.map((slot) => {
              const pl = placed[slot.key];
              const chem = pl ? perPlayerChem[pl.id] ?? 0 : 0;

              return (
                <div
                  key={slot.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, slot.key)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                >
                  {pl ? (
                    <div className="relative group">
                      <PlayerCard
                        player={pl}
                        slotPos={slot.pos}
                        chem={chem}
                        draggable
                        onDragStart={(e) => onDragStart(e, pl.id)}
                        onRemove={() => clearSlot(slot.key)}
                      />
                      <div className="absolute -bottom-8 left-0 right-0 opacity-0 group-hover:opacity-100 transition text-xs flex gap-2 justify-center">
                        <button
                          className="px-2 py-1 rounded bg-neutral-800 border border-white/10 hover:bg-neutral-700"
                          onClick={() => setSearchOpen(slot.key)}
                        >
                          Swap
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-red-700 border border-red-600 hover:bg-red-600"
                          onClick={() => clearSlot(slot.key)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <EmptySlot pos={slot.pos} selected={searchOpen === slot.key} onClick={() => setSearchOpen(slot.key)} />
                  )}
                </div>
              );
            })}
          </Pitch>

          <div className="mt-4 text-xs text-white/60 flex flex-wrap gap-4">
            <span>💡 Tip: Click a slot then search — results are filtered to eligible positions.</span>
            <span>🔴 Red dot = out of position (0 chem)</span>
            <span>🟢 Green dot = full chemistry (3/3)</span>
          </div>
        </div>

        {/* Search */}
        <aside className="col-span-4">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder={
                    searchOpen
                      ? `Search players for ${slots.find((s) => s.key === searchOpen)?.pos}…`
                      : "Search name, club, league, nation, position"
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {searchOpen && (
                <div className="mt-3 flex items-center justify-between bg-neutral-900 rounded-lg px-3 py-2">
                  <span className="text-sm text-white/80">
                    Adding to:{" "}
                    <span className="font-semibold text-green-400">
                      {slots.find((s) => s.key === searchOpen)?.pos}
                    </span>
                  </span>
                  <button className="text-white/60 hover:text-white" onClick={() => { setSearchOpen(null); setSearch(""); }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {results.length > 0 ? (
                results.map((p) => {
                  const slotPos = searchOpen ? slots.find((s) => s.key === searchOpen)?.pos : null;
                  const eligible = slotPos ? isValidForSlot(slotPos, p.positions) : true;
                  return (
                    <div
                      key={p.id}
                      className={cls(
                        "bg-neutral-900 border border-white/10 rounded-xl p-3 transition",
                        eligible ? "hover:bg-neutral-800 cursor-pointer" : "opacity-60 cursor-not-allowed"
                      )}
                      onClick={() => searchOpen && eligible && addToSlot(p, searchOpen)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 rounded-md overflow-hidden border border-white/10 shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-xs text-white/50">No image</div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate">{p.name}</span>
                            <span className="text-xs text-white/60">⭐ {p.rating ?? "-"}</span>
                            {typeof p.price === "number" && (
                              <>
                                <span className="text-white/40">•</span>
                                <span className="text-xs text-yellow-300 font-semibold">{p.price.toLocaleString()}</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-white/60 truncate">
                            {p.club || "—"} • {p.nation || "—"} • {p.league || "—"}
                          </div>
                          <div className="text-[11px] text-white/50 truncate mt-0.5">
                            Positions: {(p.positions || []).join(", ") || "—"}
                          </div>
                          {slotPos && !eligible && (
                            <div className="text-[11px] text-red-400 mt-1">Cannot play {slotPos}</div>
                          )}
                        </div>

                        {searchOpen && (
                          <button
                            disabled={!eligible}
                            className={cls(
                              "px-3 py-1.5 rounded-lg text-xs font-bold",
                              eligible ? "bg-green-500 hover:bg-green-600 text-black" : "bg-neutral-700 text-white/50"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (eligible) addToSlot(p, searchOpen);
                            }}
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : search ? (
                <div className="py-10 text-center text-white/50">No results for “{search}”.</div>
              ) : (
                <div className="py-10 text-center text-white/40">
                  Start typing to search. Click a pitch slot to filter to that position.
                </div>
              )}
            </div>
          </div>

          {/* Simple overview */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-neutral-950 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-yellow-400 font-bold text-xl">{avgRating}</div>
              <div className="text-white/60 text-xs">Avg Rating</div>
            </div>
            <div className="bg-neutral-950 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-green-400 font-bold text-xl">{teamChem}</div>
              <div className="text-white/60 text-xs">Team Chem</div>
            </div>
            <div className="bg-neutral-950 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-blue-400 font-bold text-lg">{squadPrice.toLocaleString()}</div>
              <div className="text-white/60 text-xs">Squad Coins</div>
            </div>
          </div>

          <div className="mt-4 bg-neutral-950 border border-white/10 rounded-xl p-4 text-xs text-white/60">
            <div className="font-semibold text-white/80 mb-2">Chemistry Rules (FC25)</div>
            <ul className="space-y-1">
              <li>Club: 2/4/7 → +1/+2/+3</li>
              <li>Nation: 2/5/8 → +1/+2/+3</li>
              <li>League: 3/5/8 → +1/+2/+3</li>
              <li>Out of position = 0 chem & no contribution</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}