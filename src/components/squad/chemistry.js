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
  console.log("🧪 Computing chemistry for:", Object.keys(placed).length, "slots");
  
  // Tallies (only for players that are IN POSITION)
  const clubMap = new Map();
  const nationMap = new Map();
  const leagueMap = new Map();

  const perPlayerChem = {};

  // --- First pass: count entities for players who are in their slot position
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) {
      console.log(`❌ No player in slot ${slot.key} (${slot.pos})`);
      continue;
    }

    console.log(`🎮 Checking player ${p.name} in slot ${slot.key} (${slot.pos})`);
    console.log(`📍 Player positions: [${p.positions?.join(', ') || 'none'}]`);

    // ✅ CRITICAL: Using correct parameter order
    const inPos = isValidForSlot(slot.pos, p.positions);
    console.log(`✅ ${p.name} in position: ${inPos}`);
    
    if (!inPos) {
      console.log(`❌ ${p.name} is out of position for ${slot.pos}`);
      continue;
    }

    const ck = keyOf(p.clubId, p.club);
    const nk = keyOf(p.nationId, p.nation);
    const lk = keyOf(p.leagueId, p.league);

    console.log(`🏢 ${p.name} - Club: ${p.club} (${ck}), Nation: ${p.nation} (${nk}), League: ${p.league} (${lk})`);

    if (ck) clubMap.set(ck, (clubMap.get(ck) || 0) + 1);
    if (nk) nationMap.set(nk, (nationMap.get(nk) || 0) + 1);
    if (lk) leagueMap.set(lk, (leagueMap.get(lk) || 0) + 1);
  }

  console.log("📊 Club counts:", Object.fromEntries(clubMap));
  console.log("📊 Nation counts:", Object.fromEntries(nationMap));
  console.log("📊 League counts:", Object.fromEntries(leagueMap));

  // FC25 thresholds
  const chemFromClub   = (n) => (n >= 7 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0);
  const chemFromNation = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 2 ? 1 : 0);
  const chemFromLeague = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 3 ? 1 : 0);

  // --- Second pass: compute per-player chem (only if in position)
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    const inPos = isValidForSlot(slot.pos, p.positions);
    if (!inPos) {
      perPlayerChem[p.id] = 0;
      console.log(`❌ ${p.name}: 0 chem (out of position)`);
      continue;
    }

    const
