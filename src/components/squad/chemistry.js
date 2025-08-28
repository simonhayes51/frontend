import { isValidForSlot } from "../../utils/positions";
import { getPlayerPosList } from "../../utils/getPlayerPosList";

// Flip to false when you're done debugging.
const DEBUG_CHEM = true;

function keyOf(id, name) {
  if (id != null) return `id:${id}`;
  if (name) return `nm:${String(name).trim().toLowerCase()}`;
  return null;
}

export function computeChemistry(placed, formation) {
  const clubMap = new Map();
  const nationMap = new Map();
  const leagueMap = new Map();
  const perPlayerChem = {};

  // ---------- First pass: count only in-position players ----------
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    const posList = getPlayerPosList(p);
    const inPos = isValidForSlot(slot.pos, posList);
    if (!inPos) continue;

    const ck = keyOf(p.clubId, p.club);
    const nk = keyOf(p.nationId, p.nation);
    const lk = keyOf(p.leagueId, p.league);

    if (ck) clubMap.set(ck, (clubMap.get(ck) || 0) + 1);
    if (nk) nationMap.set(nk, (nationMap.get(nk) || 0) + 1);
    if (lk) leagueMap.set(lk, (leagueMap.get(lk) || 0) + 1);
  }

  // Thresholds (FC25)
  const chemFromClub   = (n) => (n >= 7 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0);
  const chemFromNation = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 2 ? 1 : 0);
  const chemFromLeague = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 3 ? 1 : 0);

  // ---------- Second pass: assign per-player chem ----------
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    const posList = getPlayerPosList(p);
    const inPos = isValidForSlot(slot.pos, posList);

    if (DEBUG_CHEM) {
      console.groupCollapsed(
        `[CHEM] ${p.name || p.id} @ ${slot.key} (${slot.pos}) — inPos=${inPos}`
      );
      console.table({
        playerId: p.id,
        name: p.name,
        slotPos: slot.pos,
        playerPositions: posList.join(", "),
        raw_position: p.position,
        raw_altposition: p.altposition,
        array_positions: Array.isArray(p.positions) ? p.positions.join(", ") : "(none)",
        club: p.club, clubId: p.clubId,
        nation: p.nation, nationId: p.nationId,
        league: p.league, leagueId: p.leagueId,
      });
    }

    if (!inPos) {
      perPlayerChem[p.id] = 0;
      if (DEBUG_CHEM) console.groupEnd();
      continue;
    }

    const ck = keyOf(p.clubId, p.club);
    const nk = keyOf(p.nationId, p.nation);
    const lk = keyOf(p.leagueId, p.league);

    const cCount = ck ? (clubMap.get(ck) || 0) : 0;
    const nCount = nk ? (nationMap.get(nk) || 0) : 0;
    const lCount = lk ? (leagueMap.get(lk) || 0) : 0;

    const clubC   = chemFromClub(cCount);
    const nationC = chemFromNation(nCount);
    const leagueC = chemFromLeague(lCount);

    let chem = clubC + nationC + leagueC;
    if (chem > 3) chem = 3;

    perPlayerChem[p.id] = chem;

    if (DEBUG_CHEM) {
      console.log("Tallies ->", { cCount, nCount, lCount });
      console.log("Chem parts ->", { clubC, nationC, leagueC, total: chem });
      console.groupEnd();
    }
  }

  const teamChem = Math.min(
    33,
    Object.values(perPlayerChem).reduce((a, b) => a + (b || 0), 0)
  );

  if (DEBUG_CHEM) {
    console.groupCollapsed("[CHEM] Aggregates");
    console.log("ClubMap:", clubMap);
    console.log("NationMap:", nationMap);
    console.log("LeagueMap:", leagueMap);
    console.log("perPlayerChem:", perPlayerChem);
    console.log("teamChem:", teamChem);
    console.groupEnd();
  }

  return { perPlayerChem, teamChem };
}