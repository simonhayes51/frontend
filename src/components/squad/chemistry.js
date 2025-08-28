// src/components/squad/chemistry.js
import { isValidForSlot } from "../../utils/positions";

/** Prefer IDs when available; fall back to lowercased names. */
function entityKey(id, name) {
  if (id != null) return `id:${id}`;
  if (name) return `nm:${String(name).toLowerCase()}`;
  return null;
}

/**
 * placed: { [slotKey]: player|null }
 * formation: [{ key, pos }]
 * Returns: { perPlayerChem: { [playerId]: 0..3 }, teamChem: 0..33 }
 */
export function computeChemistry(placed, formation) {
  const clubCounts = new Map();
  const nationCounts = new Map();
  const leagueCounts = new Map();
  const perPlayerChem = {};

  // First pass: count club/nation/league among IN-POSITION players
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;
    const inPosition = isValidForSlot(slot.pos, p.positions);
    if (!inPosition) continue;

    const ck = entityKey(p.clubId, p.club);
    const nk = entityKey(p.nationId, p.nation);
    const lk = entityKey(p.leagueId, p.league);

    if (ck) clubCounts.set(ck, (clubCounts.get(ck) || 0) + 1);
    if (nk) nationCounts.set(nk, (nationCounts.get(nk) || 0) + 1);
    if (lk) leagueCounts.set(lk, (leagueCounts.get(lk) || 0) + 1);
  }

  // FC25 thresholds
  const clubChem   = (n) => (n >= 7 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0);
  const nationChem = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 2 ? 1 : 0);
  const leagueChem = (n) => (n >= 8 ? 3 : n >= 5 ? 2 : n >= 3 ? 1 : 0);

  // Second pass: assign per-player chem (0 if out of position)
  for (const slot of formation) {
    const p = placed[slot.key];
    if (!p) continue;

    const inPosition = isValidForSlot(slot.pos, p.positions);
    if (!inPosition) {
      perPlayerChem[p.id] = 0;
      continue;
    }

    const ck = entityKey(p.clubId, p.club);
    const nk = entityKey(p.nationId, p.nation);
    const lk = entityKey(p.leagueId, p.league);

    const c = (ck ? clubChem(clubCounts.get(ck) || 0) : 0)
            + (nk ? nationChem(nationCounts.get(nk) || 0) : 0)
            + (lk ? leagueChem(leagueCounts.get(lk) || 0) : 0);

    perPlayerChem[p.id] = Math.max(0, Math.min(3, c));
  }

  const teamChem = Math.min(
    33,
    Object.values(perPlayerChem).reduce((a, b) => a + (b || 0), 0)
  );

  return { perPlayerChem, teamChem };
}