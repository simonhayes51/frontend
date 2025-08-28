// src/components/squad/chemistry.js
import { isValidForSlot } from "../../utils/positions";

/**
 * Build a stable key for tally maps.
 * We currently only have string names from the DB, so we key on lowercased names.
 * (If you later add numeric IDs, you can pass them to keyOf and it will prefer IDs.)
 */
function keyOf(id, name) {
  if (id != null) return `id:${id}`;
  if (name) return `nm:${String(name).toLowerCase().trim()}`;
  return null;
}

// placed: { [slotKey]: player|null }
// formation: array of { key, pos }
export function computeChemistry(placed, formation) {
  // Tallies (only from players who are IN POSITION)
  const clubMap = new Map();
  const nationMap = new Map();
  const leagueMap = new Map();

  const perPlayerChem = {};

  // --- First pass: count entities for players who are in their slot position
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    // Correct order: slot position first, then player's position list
    const inPos = isValidForSlot(slot.pos, p.positions);
    if (!inPos) continue;

    // We only have names right now → use names to key
    const ck = keyOf(null, p.club);
    const nk = keyOf(null, p.nation);
    const lk = keyOf(null, p.league);

    if (ck) clubMap.set(ck, (clubMap.get(ck) || 0) + 1);
    if (nk) nationMap.set(nk, (nationMap.get(nk) || 0) + 1);
    if (lk) leagueMap.set(lk, (leagueMap.get(lk) || 0) + 1);
  }

  // FC25 thresholds
  const chemFromClub   = (n) => (n >= 7 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0);
  const chemFromNation = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 2 ? 1 : 0);
  const chemFromLeague = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 3 ? 1 : 0);

  // --- Second pass: per-player chem (only if in position)
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    const inPos = isValidForSlot(slot.pos, p.positions);
    if (!inPos) {
      perPlayerChem[p.id] = 0; // Out of position = 0 chem, no contributions
      continue;
    }

    // Again, names for keys (IDs can be plugged in later)
    const ck = keyOf(null, p.club);
    const nk = keyOf(null, p.nation);
    const lk = keyOf(null, p.league);

    const clubC   = ck ? chemFromClub(clubMap.get(ck) || 0) : 0;
    const nationC = nk ? chemFromNation(nationMap.get(nk) || 0) : 0;
    const leagueC = lk ? chemFromLeague(leagueMap.get(lk) || 0) : 0;

    let chem = clubC + nationC + leagueC;
    if (chem > 3) chem = 3;
    if (chem < 0) chem = 0;

    // (Optional) Icon/Hero logic could be added here later
    perPlayerChem[p.id] = chem;
  }

  // Team chem = sum of individual chems capped at 33
  const teamChem = Math.min(
    33,
    Object.values(perPlayerChem).reduce((a, b) => a + (b || 0), 0)
  );

  return { perPlayerChem, teamChem };
}