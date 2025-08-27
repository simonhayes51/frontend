// src/components/squad/chemistry.js
import { isValidForSlot } from "../../utils/positions";

// placed: { [slotKey]: player|null }
// formation: array of { key, pos }
export function computeChemistry(placed, formation) {
  const players = Object.values(placed).filter(Boolean);

  // club / nation / league tallies (in-position only)
  const clubMap = new Map();
  const nationMap = new Map();
  const leagueMap = new Map();

  const perPlayerChem = {};

  // First pass: collect counts (only if in slot position)
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;
    const inPos = isValidForSlot(slot.pos, p.positions);

    if (inPos) {
      if (p.club) clubMap.set(p.club, (clubMap.get(p.club) || 0) + 1);
      if (p.nation) nationMap.set(p.nation, (nationMap.get(p.nation) || 0) + 1);
      if (p.league) leagueMap.set(p.league, (leagueMap.get(p.league) || 0) + 1);
    }
  }

  // Helper to convert counts to 0..3 chem
  const chemFromClub   = (n) => (n >= 7 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0);
  const chemFromNation = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 2 ? 1 : 0);
  const chemFromLeague = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 3 ? 1 : 0);

  // Second pass: per-player chem
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    const inPos = isValidForSlot(slot.pos, p.positions);
    if (!inPos) {
      perPlayerChem[p.id] = 0;
      continue;
    }

    // base from counts
    const clubC   = p.club   ? chemFromClub(clubMap.get(p.club) || 0) : 0;
    const nationC = p.nation ? chemFromNation(nationMap.get(p.nation) || 0) : 0;
    const leagueC = p.league ? chemFromLeague(leagueMap.get(p.league) || 0) : 0;

    let chem = clubC + nationC + leagueC;
    chem = Math.max(0, Math.min(3, chem)); // cap

    // You can optionally add icon/hero perks here (only in position):
    // if (p.isIcon) { /* nation's thresholds behave differently in FC25 */ }
    // if (p.isHero) { /* hero league boosts, etc. */ }

    perPlayerChem[p.id] = chem;
  }

  const teamChem = Math.max(
    0,
    Math.min(
      33,
      Object.values(perPlayerChem).reduce((a, b) => a + (b || 0), 0)
    )
  );

  return { perPlayerChem, teamChem };
}
