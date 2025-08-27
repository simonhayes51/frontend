import React, { useEffect, useMemo, useState } from 'react';
import Pitch from '../components/squad/Pitch';
import PlayerTile from '../components/squad/PlayerTile';
import { FORMATIONS } from '../components/squad/formations';
import { computeChemistry } from '../components/squad/chemistry';
import { searchPlayers, SAMPLE_PLAYERS } from '../api/squadApi';
import '../styles/squad.css';

const cls = (...xs) => xs.filter(Boolean).join(' ');

export default function SquadBuilder() {
  const [formationKey, setFormationKey] = useState('4-3-3');
  const formation = FORMATIONS[formationKey];

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(null); // slotKey open for add/swap

  // placed players by slot key
  const [placed, setPlaced] = useState(() => Object.fromEntries(formation.map(s => [s.key, null])));

  // Re-init when formation changes (preserve same keys if they exist)
  useEffect(() => {
    setPlaced(prev => {
      const next = {};
      for (const slot of formation) next[slot.key] = prev[slot.key] || null;
      return next;
    });
  }, [formationKey]);

  const { perPlayerChem, teamChem } = useMemo(() => computeChemistry(placed, formation), [placed, formation]);

  const avgRating = useMemo(() => {
    const ps = Object.values(placed).filter(Boolean);
    if (!ps.length) return 0;
    return Math.round(ps.reduce((a, p) => a + p.rating, 0) / ps.length);
  }, [placed]);

  const squadPrice = useMemo(() => {
    const ps = Object.values(placed).filter(Boolean);
    return ps.reduce((a, p) => a + (p.price || 0), 0);
  }, [placed]);

  const [results, setResults] = useState(SAMPLE_PLAYERS);
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!search.trim()) { setResults(SAMPLE_PLAYERS); return; }
      const data = await searchPlayers(search);
      if (!cancel) setResults(data);
    })();
    return () => { cancel = true; }
  }, [search]);

  function handleDrop(e, slotKey) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('text/plain'));
    const p = (results.find(x => x.id === id) || SAMPLE_PLAYERS.find(x => x.id === id)) || null;
    setPlaced(prev => ({ ...prev, [slotKey]: p }));
    setSearchOpen(null);
  }

  function handleDragStart(e, playerId) {
    e.dataTransfer.setData('text/plain', String(playerId));
  }

  function clearSlot(slotKey) { setPlaced(prev => ({ ...prev, [slotKey]: null })); }

  function shareUrl() {
    const state = { formationKey, placed };
    const encoded = encodeURIComponent(btoa(JSON.stringify(state)));
    const url = new URL(window.location.href);
    url.searchParams.set('squad', encoded);
    return url.toString();
  }

  // Import if ?squad= is present
  useEffect(() => {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get('squad');
    if (!encoded) return;
    try {
      const state = JSON.parse(atob(decodeURIComponent(encoded)));
      if (state?.formationKey && FORMATIONS[state.formationKey]) setFormationKey(state.formationKey);
      if (state?.placed) setPlaced(state.placed);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="text-xl font-black tracking-tight"><span className="text-lime-400">FUT</span> Squad Builder</div>
          <div className="ml-auto flex items-center gap-3">
            <select
              className="bg-neutral-800 rounded-xl px-3 py-2 text-sm"
              value={formationKey}
              onChange={(e) => setFormationKey(e.target.value)}
            >
              {Object.keys(FORMATIONS).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <div className="flex items-center gap-3 text-sm">
              <div className="rounded-xl bg-neutral-800 px-3 py-2">Avg ⭐ {avgRating || '-'}</div>
              <div className="rounded-xl bg-neutral-800 px-3 py-2">Team Chem {teamChem}/33</div>
              <div className="rounded-xl bg-neutral-800 px-3 py-2">Price {squadPrice.toLocaleString()}c</div>
            </div>
            <button
              className="rounded-xl bg-lime-400 text-black font-semibold px-4 py-2"
              onClick={() => navigator.clipboard.writeText(shareUrl())}
            >Share Link</button>
            <button
              className="rounded-xl bg-neutral-800 px-4 py-2"
              onClick={() => setPlaced(Object.fromEntries(formation.map(s => [s.key, null])))}
            >Clear</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-12 gap-6">
        {/* Pitch */}
        <div className="col-span-8">
          <Pitch>
            {formation.map(slot => {
              const pl = placed[slot.key];
              const chem = pl ? (perPlayerChem[pl.id] ?? 0) : 0;
              const valid = pl ? pl.positions?.includes?.(slot.pos) : true;
              return (
                <div key={slot.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, slot.key)}
                  className="absolute"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div
                    className={cls(
                      'w-28 rounded-2xl p-2 select-none cursor-pointer',
                      pl ? 'bg-neutral-950/70 border border-neutral-700' : 'bg-white/10 border border-white/20',
                      !valid && 'ring-2 ring-yellow-400'
                    )}
                    onClick={() => setSearchOpen(slot.key)}
                  >
                    {pl ? (
                      <PlayerTile
                        player={pl}
                        badge={<div className={cls('ml-auto text-xs font-black w-6 h-6 rounded-full grid place-items-center', chem>=3?'bg-lime-400 text-black':chem===2?'bg-lime-300 text-black':chem===1?'bg-lime-200 text-black':'bg-neutral-700 text-white')}>{chem}</div>}
                        draggable
                        onDragStart={(e) => handleDragStart(e, pl.id)}
                      />
                    ) : (
                      <div className="w-28 h-14 grid place-items-center text-xs font-semibold uppercase tracking-wide" title="Click to add player">{slot.pos}</div>
                    )}

                    {pl && (
                      <div className="mt-1 flex justify-between text-[10px] opacity-80">
                        <button className="underline" onClick={(e) => { e.stopPropagation(); setSearchOpen(slot.key); }}>Swap</button>
                        <button className="underline" onClick={(e) => { e.stopPropagation(); clearSlot(slot.key); }}>Clear</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </Pitch>
          <p className="mt-3 text-xs text-neutral-400">Tip: Yellow ring = out of position (0 chem & no contribution). Drag tiles between slots to rearrange.</p>
        </div>

        {/* Search */}
        <div className="col-span-4">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-3">
            <div className="flex items-center gap-2">
              <input
                className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm"
                placeholder={searchOpen ? `Adding to ${searchOpen}…` : 'Search name, club, league, nation, position'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="mt-3 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {results.map(p => (
                <div key={p.id} draggable onDragStart={(e) => handleDragStart(e, p.id)}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 px-3 py-2 cursor-grab active:cursor-grabbing">
                  <div className="flex items-center gap-3">
                    <PlayerTile player={p} />
                    <button
                      className="ml-2 rounded-lg bg-lime-400 text-black text-xs font-bold px-2 py-1"
                      onClick={() => searchOpen ? setPlaced(prev => ({ ...prev, [searchOpen]: p })) : null}
                    >Add</button>
                  </div>
                </div>
              ))}
              {!results.length && (
                <div className="text-sm text-neutral-400">No players match your search.</div>
              )}
            </div>
          </div>

          {/* Rules */}
          <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-950 p-3 text-sm">
            <div className="font-semibold mb-2">Chemistry Rules (FC25‑style)</div>
            <ul className="list-disc pl-5 space-y-1 text-neutral-300 text-[13px]">
              <li>Club: 2/4/7 players → +1/+2/+3</li>
              <li>Nation: 2/5/8 players → +1/+2/+3</li>
              <li>League: 3/5/8 players → +1/+2/+3</li>
              <li>Icons & Heroes: 3 chem when in position. Icons: +2 nation increments, +1 to all leagues. Heroes: +1 nation, +2 to their league.</li>
              <li>Out of position = 0 chem and no contribution.</li>
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
