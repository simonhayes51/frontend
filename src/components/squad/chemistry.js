// src/components/squad/chemistry.js
import { isValidForSlot } from "../../utils/positions";

/** Prefer numeric IDs; fallback to lowercase names for keys. */
function keyOf(id, name) {
  if (id != null) return `id:${id}`;
  if (name) return `nm:${String(name).toLowerCase()}`;
  return null;
}

// placed: { [slotKey]: player|null }
// formation: array of { key, pos }
export function computeChemistry(placed, formation) {
  const clubMap = new Map();
  const nationMap = new Map();
  const leagueMap = new Map();
  const perPlayerChem = {};

  // First pass: count in-position only
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;
    const inPos = isValidForSlot(slot.pos, p.positions);
    if (!inPos) continue;

    const ck = keyOf(p.clubId, p.club);
    const nk = keyOf(p.nationId, p.nation);
    const lk = keyOf(p.leagueId, p.league);

    if (ck) clubMap.set(ck, (clubMap.get(ck) || 0) + 1);
    if (nk) nationMap.set(nk, (nationMap.get(nk) || 0) + 1);
    if (lk) leagueMap.set(lk, (leagueMap.get(lk) || 0) + 1);
  }

  // FC25 thresholds
  const chemFromClub   = (n) => (n >= 7 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0);
  const chemFromNation = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 2 ? 1 : 0);
  const chemFromLeague = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 3 ? 1 : 0);

  // Second pass: assign chem (only if in position)
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    const inPos = isValidForSlot(slot.pos, p.positions);
    if (!inPos) { perPlayerChem[p.id] = 0; continue; }

    const ck = keyOf(p.clubId, p.club);
    const nk = keyOf(p.nationId, p.nation);
    const lk = keyOf(p.leagueId, p.league);

    const clubC   = ck ? chemFromClub(clubMap.get(ck) || 0) : 0;
    const nationC = nk ? chemFromNation(nationMap.get(nk) || 0) : 0;
    const leagueC = lk ? chemFromLeague(leagueMap.get(lk) || 0) : 0;

    let chem = clubC + nationC + leagueC;
    if (chem > 3) chem = 3;
    if (chem < 0) chem = 0;

    // (Optional) Icon/Hero logic spot

    perPlayerChem[p.id] = chem;
  }

  const teamChem = Math.min(
    33,
    Object.values(perPlayerChem).reduce((a, b) => a + (b || 0), 0)
  );

  return { perPlayerChem, teamChem };
}