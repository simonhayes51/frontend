import React, { useEffect, useMemo, useRef, useState } from "react";
import Pitch from "../components/squad/Pitch";
import PlayerTile from "../components/squad/PlayerTile";
import { FORMATIONS } from "../components/squad/formations";
import { computeChemistry } from "../components/squad/chemistry";
import { searchPlayers, enrichPlayer } from "../api/squadApi";
import "../styles/squad.css";

const cls = (...xs) => xs.filter(Boolean).join(" ");

export default function SquadBuilder() {
  const [formationKey, setFormationKey] = useState("4-3-3");
  const formation = FORMATIONS[formationKey];

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(null);

  const [placed, setPlaced] = useState(() =>
    Object.fromEntries(formation.map((s) => [s.key, null]))
  );
  useEffect(() => {
    setPlaced((prev) => {
      const next = {};
      for (const slot of formation) next[slot.key] = prev[slot.key] || null;
      return next;
    });
  }, [formationKey]);

  const { perPlayerChem, teamChem } = useMemo(
    () => computeChemistry(placed, formation),
    [placed, formation]
  );

  const avgRating = useMemo(() => {
    const ps = Object.values(placed).filter(Boolean);
    if (!ps.length) return 0;
    return Math.round(ps.reduce((a, p) => a + (Number(p.rating) || 0), 0) / ps.length);
  }, [placed]);

  const squadPrice = useMemo(() => {
    const ps = Object.values(placed).filter(Boolean);
    return ps.reduce((a, p) => a + (Number(p.price) || 0), 0);
  }, [placed]);

  // search (debounced & cached)
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const queryCache = useRef(new Map());
  useEffect(() => {
    let canceled = false;
    const q = search.trim();
    if (q.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }
    const t = setTimeout(async () => {
      if (queryCache.current.has(q)) {
        setResults(queryCache.current.get(q));
        return;
      }
      setLoading(true);
      const data = await searchPlayers(q);
      if (!canceled) {
        queryCache.current.set(q, data);
        setResults(data);
        setLoading(false);
      }
    }, 250);
    return () => {
      canceled = true;
      clearTimeout(t);
    };
  }, [search]);

  // DnD
  function handleDrop(e, slotKey) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    const base = results.find((x) => x.id === id) || null;
    if (!base) return;
    enrichPlayer(base).then((full) => {
      setPlaced((prev) => ({ ...prev, [slotKey]: full }));
    });
    setSearchOpen(null);
  }
  function handleDragStart(e, playerId) {
    e.dataTransfer.setData("text/plain", String(playerId));
  }
  const clearSlot = (slotKey) => setPlaced((p) => ({ ...p, [slotKey]: null }));

  function shareUrl() {
    const state = { formationKey, placed };
    const encoded = encodeURIComponent(btoa(JSON.stringify(state)));
    const url = new URL(window.location.href);
    url.searchParams.set("squad", encoded);
    return url.toString();
  }

  // import from ?squad=
  useEffect(() => {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get("squad");
    if (!encoded) return;
    try {
      const state = JSON.parse(atob(decodeURIComponent(encoded)));
      if (state?.formationKey && FORMATIONS[state.formationKey])
        setFormationKey(state.formationKey);
      if (state?.placed) setPlaced(state.placed);
    } catch {}
  }, []);

  // vertical mapping + gentle anti-overlap
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const slotsAdjusted = useMemo(() => {
    const mapped = formation.map((s) => {
      const x = s.y;          // left% <- y
      const y = 100 - s.x;    // top%  <- 100 - x
      return { key: s.key, pos: s.pos, x, y };
    });
    const threshold = 6;
    const push = 2.2;
    for (let i = 0; i < mapped.length; i++) {
      for (let j = i + 1; j < mapped.length; j++) {
        const a = mapped[i], b = mapped[j];
        if (Math.abs(a.x - b.x) < threshold && Math.abs(a.y - b.y) < threshold) {
          const dir = a.y <= b.y ? -1 : 1;
          a.y = clamp(a.y + dir * push, 5, 95);
          b.y = clamp(b.y - dir * push, 5, 95);
        }
      }
    }
    return mapped;
  }, [formation]);

  const validPos = (pl, pos) =>
    !pl || !Array.isArray(pl.positions) || !pl.positions.length || pl.positions.includes(pos);

  return (
    <div className="min-h-screen bg-[#0a0e11] text-neutral-100">
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-[#0a0e11]/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="text-xl font-black tracking-tight">
            <span className="text-lime-400">FUT</span> Squad Builder
          </div>
          <div className="ml-auto flex items-center flex-wrap gap-3">
            <select
              className="bg-neutral-800 rounded-xl px-3 py-2 text-sm"
              value={formationKey}
              onChange={(e) => setFormationKey(e.target.value)}
              title="Formation"
            >
              {Object.keys(FORMATIONS).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <div className="rounded-xl bg-neutral-800 px-3 py-2 text-sm">Avg ⭐ {avgRating || "-"}</div>
            <div className="rounded-xl bg-neutral-800 px-3 py-2 text-sm">Chem {teamChem}/33</div>
            <div className="rounded-xl bg-neutral-800 px-3 py-2 text-sm">Price {squadPrice.toLocaleString()}c</div>
            <button className="rounded-xl bg-lime-400 text-black font-semibold px-4 py-2"
              onClick={() => navigator.clipboard.writeText(shareUrl())}>Share Link</button>
            <button className="rounded-xl bg-neutral-800 px-4 py-2"
              onClick={() => setPlaced(Object.fromEntries(formation.map((s) => [s.key, null])))}>Clear</button>
          </div>
        </div>
      </header>

      {/* Pitch left, search right */}
      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-12 gap-6">
        {/* Pitch */}
        <div className="col-span-8">
          <Pitch>
            {slotsAdjusted.map((slot) => {
              const pl = placed[slot.key];
              const chem = pl ? perPlayerChem[pl.id] ?? 0 : 0;
              const ok = validPos(pl, slot.pos);
              return (
                <div
                  key={slot.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, slot.key)}
                  className="absolute"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div
                    className={cls(
                      "p-1 rounded-2xl border",
                      pl ? "border-transparent" : "bg-white/10 border-white/20"
                    )}
                    onClick={() => setSearchOpen(slot.key)}
                    title={ok ? slot.pos : `${slot.pos} (out of position)`}
                  >
                    {pl ? (
                      <>
                        <PlayerTile
                          player={pl}
                          chem={chem}
                          size="lg"
                          draggable
                          onDragStart={(e) => handleDragStart(e, pl.id)}
                        />
                        <div className="mt-1 text-[10px] uppercase tracking-wide text-neutral-300 text-center">
                          {slot.pos}
                        </div>
                        <div className="mt-1 flex justify-between text-[10px] opacity-80">
                          <button className="underline" onClick={(e) => { e.stopPropagation(); setSearchOpen(slot.key); }}>Swap</button>
                          <button className="underline" onClick={(e) => { e.stopPropagation(); clearSlot(slot.key); }}>Clear</button>
                        </div>
                      </>
                    ) : (
                      <div className="w-[96px] h-[64px] grid place-items-center text-xs font-semibold uppercase tracking-wide">
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
        <div className="col-span-4">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-3">
            <SearchPanel
              search={search}
              setSearch={setSearch}
              loading={loading}
              results={results}
              onAdd={async (p) => {
                if (!searchOpen) return;
                const full = await enrichPlayer(p);
                setPlaced((prev) => ({ ...prev, [searchOpen]: full }));
              }}
            />
          </div>

          <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-950 p-3 text-sm">
            <div className="font-semibold mb-2">Chemistry (FC25)</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-300 text-[13px]">
              <li>Club: 2/4/7 → +1/+2/+3</li>
              <li>Nation: 2/5/8 → +1/+2/+3</li>
              <li>League: 3/5/8 → +1/+2/+3</li>
              <li>Icons/Heroes: 3 chem in position; special boosts to leagues/nations.</li>
            </ul>
          </div>
        </div>
      </main>

      {searchOpen && (
        <div className="fixed bottom-4 right-4 text-xs px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700">
          Adding to: <span className="font-semibold">{searchOpen}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Search panel ---------- */
function SearchPanel({ search, setSearch, loading, results, onAdd }) {
  const [active, setActive] = useState(0);
  return (
    <>
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm"
          placeholder="Search player…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (!results.length) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); onAdd(results[active]); }
          }}
        />
        {loading && <div className="text-xs text-neutral-400">Loading…</div>}
      </div>

      <div className="mt-3 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {results.map((p, i) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", String(p.id))}
            className={cls(
              "rounded-2xl border px-3 py-2 cursor-grab active:cursor-grabbing bg-neutral-900",
              i === active ? "border-lime-400" : "border-neutral-800"
            )}
            onMouseEnter={() => setActive(i)}
          >
            <PlayerTile
              player={p}
              size="lg"
              rightSlot={
                <button className="rounded-lg bg-lime-400 text-black text-xs font-bold px-2 py-1"
                        onClick={() => onAdd(p)}>Add</button>
              }
            />
          </div>
        ))}
        {!results.length && !loading && (
          <div className="text-sm text-neutral-400">No players match your search.</div>
        )}
      </div>
    </>
  );
}
