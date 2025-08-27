const thresholds = {
  club:   [2, 4, 7],
  nation: [2, 5, 8],
  league: [3, 5, 8],
};

const inPos = (player, slotPos) => !!player && player.positions?.includes?.(slotPos);

export function countIncrements(pairs) {
  const inc = {
    club: new Map(),
    nation: new Map(),
    league: new Map(),
  };
  const add = (m, k, by = 1) => m.set(k, (m.get(k) || 0) + by);

  for (const { player, slotPos } of pairs) {
    if (!player) continue;
    if (!inPos(player, slotPos)) continue; // OOP gives nothing

    if (player.isIcon) {
      add(inc.nation, player.nation, 2);   // +2 nation
      add(inc.league, "*", 1);            // +1 to every league later
    } else if (player.isHero) {
      add(inc.nation, player.nation, 1);   // +1 nation
      add(inc.league, player.league, 2);   // +2 their league
    } else {
      add(inc.club, player.club, 1);
      add(inc.nation, player.nation, 1);
      add(inc.league, player.league, 1);
    }
  }
  return inc;
}

const chemFrom = (kind, n) => {
  const [a,b,c] = thresholds[kind];
  if (n >= c) return 3; if (n >= b) return 2; if (n >= a) return 1; return 0;
};

export function computeChemistry(placed, formation) {
  const pairs = formation.map(s => ({ slotPos: s.pos, player: placed[s.key] || null }));
  const inc = countIncrements(pairs);
  const leagueGlobal = inc.league.get("*") || 0;

  const perPlayerChem = {};
  let teamChem = 0;

  for (const { slotPos, player } of pairs) {
    if (!player) continue;
    if (!inPos(player, slotPos)) { perPlayerChem[player.id] = 0; continue; }

    if (player.isIcon || player.isHero) { perPlayerChem[player.id] = 3; teamChem += 3; continue; }

    const cc = inc.club.get(player.club)   || 0;
    const nc = inc.nation.get(player.nation) || 0;
    const lc = (inc.league.get(player.league) || 0) + leagueGlobal;

    const chem = Math.min(3, chemFrom('club',cc) + chemFrom('nation',nc) + chemFrom('league',lc));
    perPlayerChem[player.id] = chem; teamChem += chem;
  }
  return { perPlayerChem, teamChem };
}
