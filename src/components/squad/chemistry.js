// src/components/squad/chemistry.js
import { isValidForSlot } from "../../utils/positions";

/**
 * Prefer stable numeric IDs for club/nation/league; fall back to
 * lowercased names when an ID isn't available.
 */
function keyOf(id, name) {
  if (id != null) return `id:${id}`;
  if (name) return `nm:${String(name).toLowerCase()}`;
  return null;
}

/**
 * placed:   { [slotKey]: player|null }
 * formation: Array<{ key: string, pos: string }>
 * player:   { id: number, positions: string[], club?: string, nation?: string, league?: string,
 *             clubId?: number, nationId?: number, leagueId?: number, isIcon?: boolean, isHero?: boolean }
 */
export function computeChemistry(placed, formation) {
  // Tallies for in-position players only
  const clubMap = new Map();
  const nationMap = new Map();
  const leagueMap = new Map();

  const perPlayerChem = {};

  // --- First pass: count entities for players who are in their slot position
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    // ✅ Correct order: (playerPositions, slotPosition)
    const inPos = isValidForSlot(p.positions, slot.pos);
    if (!inPos) continue;

    const ck = keyOf(p.clubId, p.club);
    const nk = keyOf(p.nationId, p.nation);
    const lk = keyOf(p.leagueId, p.league);

    if (ck) clubMap.set(ck, (clubMap.get(ck) || 0) + 1);
    if (nk) nationMap.set(nk, (nationMap.get(nk) || 0) + 1);
    if (lk) leagueMap.set(lk, (leagueMap.get(lk) || 0) + 1);
  }

  // FC25-like thresholds
  const chemFromClub   = (n) => (n >= 7 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0);
  const chemFromNation = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 2 ? 1 : 0);
  const chemFromLeague = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 3 ? 1 : 0);

  // --- Second pass: compute per-player chem (only if in position)
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    const inPos = isValidForSlot(p.positions, slot.pos);
    if (!inPos) {
      perPlayerChem[p.id] = 0;
      continue;
    }

    const ck = keyOf(p.clubId, p.club);
    const nk = keyOf(p.nationId, p.nation);
    const lk = keyOf(p.leagueId, p.league);

    const clubC   = ck ? chemFromClub(  clubMap.get(ck) || 0) : 0;
    const nationC = nk ? chemFromNation(nationMap.get(nk) || 0) : 0;
    const leagueC = lk ? chemFromLeague(leagueMap.get(lk) || 0) : 0;

    let chem = clubC + nationC + leagueC;

    // (Optional) icon/hero tweaks can be applied here if needed
    // if (p.isIcon) { ... }
    // if (p.isHero) { ... }

    perPlayerChem[p.id] = Math.max(0, Math.min(3, chem));
  }

  const teamChem = Math.max(
    0,
    Math.min(
      33,
      Object.values(perPlayerChem).reduce((sum, v) => sum + (v || 0), 0)
    )
  );

  return { perPlayerChem, teamChem };
}

export default computeChemistry;
