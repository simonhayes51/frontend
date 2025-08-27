// src/pages/SquadBuilder.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Pitch from "../components/squad/Pitch";
import PlayerTile from "../components/squad/PlayerTile";
import { FORMATIONS } from "../components/squad/formations";
import { VERTICAL_COORDS } from "../components/squad/formations_vertical";
import { computeChemistry } from "../components/squad/chemistry";
import { searchPlayers, enrichPlayer } from "../api/squadApi";
import "../styles/squad.css";

const cls = (...xs) => xs.filter(Boolean).join(" ");

// --- helpers ---------------------------------------------------------------
function rotateSlot(slot) {
  // Fallback: rotate (x,y) -> (y, 100 - x)
  return { ...slot, x: slot.y, y: 100 - slot.x };
}
function rotateFormationSlots(slots) {
  return (slots || []).map(rotateSlot);
}
function getVerticalSlots(formationKey) {
  return VERTICAL_COORDS[formationKey] || rotateFormationSlots(FORMATIONS[formationKey] || []);
}

// chem badge color (tiny dot)
function chemDotClass(chem) {
  if (chem >= 3) return "bg-lime-400";
  if (chem === 2) return "bg-lime-300";
  if (chem === 1) return "bg-amber-300";
  return "bg-neutral-600";
}

// format coins
const c = (n) => (typeof n === "number" ? `${n.toLocaleString()}c` : "—");

// --- component -------------------------------------------------------------
export default function SquadBuilder() {
  const [formationKey, setFormationKey] = useState("4-3-3");
  const slots = useMemo(() => getVerticalSlots(formationKey), [formationKey]);

  // placed players by slot key
  const [placed, setPlaced] = useState(() => Object.fromEntries(slots.map((s) => [s.key, null])));

  // When formation changes, keep by same slot key if present
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
    if (ps.length === 0) return "-";
    return Math.round(ps.reduce((a, p) => a + (p.rating || 0), 0) / ps.length);
  }, [placed]);

  const squadPrice = useMemo(() => {
    return Object.values(placed)
      .filter(Boolean)
      .reduce((a, p) => a + (p.price || 0), 0);
  }, [placed]);

  // --- search --------------------------------------------------------------
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(null); // which slot we’re adding to
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
    }, 350); // smooth, not twitchy
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  async function addPlayerToSlot(basePlayer, slotKey) {
    const full = await enrichPlayer(basePlayer);
    setPlaced((prev) => ({ ...prev, [slotKey]: full }));
  }

  // --- DnD -----------------------------------------------------------------
  function handleDragStart(e, playerId) {
    e.dataTransfer.setData("text/plain", String(playerId));
  }

  function handleDrop(e, slotKey) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    const base = results.find((x) => x.id === id) || null;
    if (!base) return;
    addPlayerToSlot(base, slotKey);
    setSearchOpen(null);
  }

  function clearSlot(slotKey) {
    setPlaced((prev) => ({ ...prev, [slotKey]: null }));
  }

  // --- shareable state -----------------------------------------------------
  function shareUrl() {
    const pruned = Object.fromEntries(
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
              isIcon: v.isIcon,
              isHero: v.isHero,
            }
          : null,
      ])
    );
    const state = { formationKey, placed: pruned };
    const encoded = encodeURIComponent(btoa(JSON.stringify(state)));
    const url = new URL(window.location.href);
    url.searchParams.set("squad", encoded);
    return url.toString();
  }

  // Import if ?squad= is present
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center gap-3">
          <div className="text-xl font-black tracking-tight">
            <span className="text-lime-400">FUT</span> Squad Builder
          </div>

          <div className="ml-4">
            <select
              className="bg-neutral-900 rounded-xl px-3 py-2 text-sm border border-neutral-700"
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

          <div className="ml-auto flex items-center gap-3 text-sm">
            <div className="rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2">
              Avg ⭐ {avgRating}
            </div>
            <div className="rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2">
              Chem {teamChem}/33
            </div>
            <div className="rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2">
              Price {c(squadPrice)}
            </div>
            <button
              className="rounded-xl bg-lime-400 text-black font-semibold px-4 py-2"
              onClick={() => navigator.clipboard.writeText(shareUrl())}
              title="Copy shareable link"
            >
              Share Link
            </button>
            <button
              className="rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2"
              onClick={() => setPlaced(Object.fromEntries(slots.map((s) => [s.key, null])))}
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Body: Pitch + Search */}
      <main className="mx-auto max-w-[1400px] px-4 py-6 grid grid-cols-12 gap-6">
        {/* Pitch */}
        <div className="col-span-8">
          <Pitch
            orientation="vertical" // your Pitch can ignore this or use to draw lines
            className="rounded-[28px] border border-neutral-800 bg-gradient-to-b from-emerald-950/40 to-emerald-900/20"
          >
            {slots.map((slot) => {
              const pl = placed[slot.key];
              const chem = pl ? perPlayerChem[pl.id] ?? 0 : 0;
              const valid = pl ? pl.positions?.includes?.(slot.pos) : true;

              return (
                <div
                  key={slot.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, slot.key)}
                  className="absolute"
                  style={{
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className={cls(
                      "w-[120px] rounded-2xl p-2 select-none cursor-pointer shadow-lg",
                      pl
                        ? "bg-neutral-950/75 border border-neutral-700"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    )}
                    onClick={() => setSearchOpen(slot.key)}
                  >
                    {pl ? (
                      <>
                        <div className="flex items-start gap-2">
                          <PlayerTile
                            player={pl}
                            size="md"
                            draggable
                            onDragStart={(e) => handleDragStart(e, pl.id)}
                          />
                          <div className="ml-auto mt-1 flex items-center gap-2">
                            {/* tiny chem dot */}
                            <span
                              className={cls("inline-block w-2.5 h-2.5 rounded-full", chemDotClass(chem))}
                              title={`Chem ${chem}/3${!valid ? " • out of position" : ""}`}
                            />
                          </div>
                        </div>

                        {/* meta row */}
                        <div className="mt-1 text-[10px] leading-4 text-neutral-300">
                          <div className="flex justify-between">
                            <span className="uppercase">{slot.pos}</span>
                            <span className="font-semibold">{c(pl.price)}</span>
                          </div>
                          {!valid && (
                            <div className="text-amber-300">Out of position</div>
                          )}
                        </div>

                        {/* actions */}
                        <div className="mt-1 flex justify-between text-[10px] opacity-80">
                          <button
                            className="underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchOpen(slot.key);
                            }}
                          >
                            Swap
                          </button>
                          <button
                            className="underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearSlot(slot.key);
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </>
                    ) : (
                      <div
                        className="w-[116px] h-[64px] grid place-items-center text-[11px] font-semibold uppercase tracking-wide text-neutral-300"
                        title="Click to add player"
                      >
                        {slot.pos}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </Pitch>

          <p className="mt-3 text-xs text-neutral-400">
            Tip: drag between slots to rearrange. Out-of-position = 0 chem (no contributions).
          </p>
        </div>

        {/* Search panel */}
        <aside className="col-span-4">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-3">
            <div className="flex items-center gap-2">
              <input
                className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm"
                placeholder={
                  searchOpen ? `Adding to ${searchOpen}…` : "Search name, club, league, nation, position"
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mt-3 max-h-[64vh] overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {results.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <PlayerTile
                      player={p}
                      size="sm"
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id)}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{p.name}</div>
                      <div className="text-[11px] text-neutral-400">
                        {p.league || p.club || p.nation || "—"}
                      </div>
                      <div className="text-[11px] text-neutral-300">
                        ⭐ {p.rating ?? "-"} • {c(p.price)}
                      </div>
                    </div>
                    <button
                      className="ml-auto rounded-lg bg-lime-400 text-black text-xs font-bold px-3 py-1"
                      onClick={() => searchOpen && addPlayerToSlot(p, searchOpen)}
                      disabled={!searchOpen}
                      title={searchOpen ? `Add to ${searchOpen}` : "Click a pitch slot first"}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
              {!results.length && (
                <div className="text-sm text-neutral-400">Start typing to search players…</div>
              )}
            </div>
          </div>

          {/* Rules */}
          <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-950 p-3 text-sm">
            <div className="font-semibold mb-2">Chemistry Rules (FC25-style)</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-300 text-[13px]">
              <li>Club: 2 / 4 / 7 players → +1 / +2 / +3</li>
              <li>Nation: 2 / 5 / 8 players → +1 / +2 / +3</li>
              <li>League: 3 / 5 / 8 players → +1 / +2 / +3</li>
              <li>
                Icons/Heroes: 3 chem in position. Icons boost nation globally; Heroes boost their league.
              </li>
              <li>Out of position → 0 chem, contributes nothing.</li>
            </ul>
          </div>
        </aside>
      </main>

      {searchOpen && (
        <div className="fixed bottom-4 right-4 text-xs px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700">
          Adding to: <span className="font-semibold">{searchOpen}</span>
        </div>
      )}
    </div>
  );
}
