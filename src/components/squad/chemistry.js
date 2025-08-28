// src/components/squad/chemistry.js
import { isValidForSlot } from "../../utils/positions";

/**
 * Enhanced chemistry calculation with proper Icon/Hero bonuses
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

  // Track Icons and Heroes for global bonuses
  const iconsInPosition = [];
  const heroesInPosition = [];

  const perPlayerChem = {};

  // --- First pass: count entities for players who are in their slot position
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    // ✅ FIXED: Using correct parameter order
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

  // Enhanced FC25 chemistry thresholds
  const chemFromClub   = (n) => (n >= 7 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0);
  const chemFromNation = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 2 ? 1 : 0);
  const chemFromLeague = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 3 ? 1 : 0);

  // Icon global nation boost: Icons add +1 to nation count for chemistry calculation
  const iconNationBoost = new Map();
  iconsInPosition.forEach(icon => {
    const nk = keyOf(icon.nationId, icon.nation);
    if (nk) {
      iconNationBoost.set(nk, (iconNationBoost.get(nk) || 0) + 1);
    }
  });

  // Hero global league boost: Heroes add +1 to league count for chemistry calculation  
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

    // Base chemistry from connections
    let clubC = ck ? chemFromClub(clubMap.get(ck) || 0) : 0;
    let nationC = nk ? chemFromNation((nationMap.get(nk) || 0) + (iconNationBoost.get(nk) || 0)) : 0;
    let leagueC = lk ? chemFromLeague((leagueMap.get(lk) || 0) + (heroLeagueBoost.get(lk) || 0)) : 0;

    // Special card bonuses
    if (p.isIcon || p.isHero) {
      // Icons and Heroes get automatic 3 chemistry when in position
      perPlayerChem[p.id] = 3;
    } else {
      // Regular players: sum bonuses, cap at 3
      let totalChem = clubC + nationC + leagueC;
      if (totalChem > 3) totalChem = 3;
      if (totalChem < 0) totalChem = 0;
