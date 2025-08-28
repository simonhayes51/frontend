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

// placed: { [slotKey]: player|null }
// formation: array of { key, pos }
export function computeChemistry(placed, formation) {
  // Tallies (only for players that are IN POSITION)
  const clubMap = new Map();
  const nationMap = new Map();
  const leagueMap = new Map();

  const perPlayerChem = {};

  // Track Icons and Heroes for global bonuses
  const iconsInPosition = [];
  const heroesInPosition = [];

  // --- First pass: count entities for players who are in their slot position
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    // ✅ FIXED: Using correct parameter order (slotPosition, playerPositions)
    const inPos = isValidForSlot(slot.pos, p.positions);
    if (!inPos) continue;

    // Track special cards
    if (p.isIcon) iconsInPosition.push(p);
    if (p.isHero) heroesInPosition.push(p);

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

  // Icon global nation boost
  const iconNationBoost = new Map();
  iconsInPosition.forEach(icon => {
    const nk = keyOf(icon.nationId, icon.nation);
    if (nk) {
      iconNationBoost.set(nk, (iconNationBoost.get(nk) || 0) + 1);
    }
  });

  // Hero global league boost
  const heroLeagueBoost = new Map();
  heroesInPosition.forEach(hero => {
    const lk = keyOf(hero.leagueId, hero.league);
    if (lk) {
      heroLeagueBoost.set(lk, (heroLeagueBoost.get(lk) || 0) + 1);
    }
  });

  // --- Second pass: compute per-player chem (only if in position)
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    const inPos = isValidForSlot(slot.pos, p.positions);
    if (!inPos) {
      perPlayerChem[p.id] = 0;
      continue;
    }

    const ck = keyOf(p.clubId, p.club);
    const nk = keyOf(p.nationId, p.nation);
    const lk = keyOf(p.leagueId, p.league);

    // Special cards get automatic 3 chemistry when in position
    if (p.isIcon || p.isHero) {
      perPlayerChem[p.id] = 3;
    } else {
      // Regular players: calculate based on connections + global bonuses
      const clubC = ck ? chemFromClub(clubMap.get(ck) || 0) : 0;
      const nationC = nk ? chemFromNation((nationMap.get(nk) || 0) + (iconNationBoost.get(nk) || 0)) : 0;
      const leagueC = lk ? chemFromLeague((leagueMap.get(lk) || 0) + (heroLeagueBoost.get(lk) || 0)) : 0;

      let chem = clubC + nationC + leagueC;
      if (chem > 3) chem = 3;
      if (chem < 0) chem = 0;

      perPlayerChem[p.id] = chem;
    }
  }

  // Team chem is the sum of individual chem capped at 33
  const teamChem = Math.min(
    33,
    Object.values(perPlayerChem).reduce((a, b) => a + (b || 0), 0)
  );

  return { perPlayerChem, teamChem };
}
