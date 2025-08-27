export const API_BASE = import.meta.env.VITE_API_URL || "";

// SEARCH players (expects your FastAPI to support /api/search-players?q=...)
export async function searchPlayers(query) {
  const q = (query || "").trim();
  if (!q) return [];
  try {
    const r = await fetch(`${API_BASE}/api/search-players?q=${encodeURIComponent(q)}`, {
      credentials: "include",
    });
    if (!r.ok) throw new Error(`search ${r.status}`);
    const data = await r.json();
    // expected: { players: [{ id, name, rating, nation, league, club, positions[], isIcon?, isHero?, price? }] }
    return data.players || [];
  } catch (e) {
    console.warn("searchPlayers fallback:", e);
    // Fallback: tiny local pool so the page still works in dev
    return SAMPLE_PLAYERS.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  }
}

// (Optional) fetch prices in bulk from your backend (FUT.GG/FUTBIN data you already ingest)
export async function fetchPrices(ids, platform = "ps") {
  if (!ids?.length) return {};
  try {
    const r = await fetch(`${API_BASE}/api/prices?ids=${ids.join(',')}&platform=${platform}`, {
      credentials: "include",
    });
    if (!r.ok) throw new Error(`prices ${r.status}`);
    return await r.json(); // expected { [id]: price }
  } catch (e) {
    console.warn("fetchPrices fallback:", e);
    return {};
  }
}

// Local dev sample (only used when search falls back)
export const SAMPLE_PLAYERS = [
  { id: 1,  name: "Ederson", rating: 88, nation: "Brazil", league: "Premier League", club: "Manchester City", positions: ["GK"], price: 18000 },
  { id: 2,  name: "Kyle Walker", rating: 88, nation: "England", league: "Premier League", club: "Manchester City", positions: ["RB", "RWB"], price: 24000 },
  { id: 3,  name: "Rúben Dias", rating: 89, nation: "Portugal", league: "Premier League", club: "Manchester City", positions: ["RCB", "LCB"], price: 32000 },
  { id: 4,  name: "Virgil van Dijk", rating: 90, nation: "Netherlands", league: "Premier League", club: "Liverpool", positions: ["LCB", "RCB"], price: 50000 },
  { id: 5,  name: "Andrew Robertson", rating: 87, nation: "Scotland", league: "Premier League", club: "Liverpool", positions: ["LB", "LWB"], price: 18000 },
  { id: 6,  name: "Rodri", rating: 91, nation: "Spain", league: "Premier League", club: "Manchester City", positions: ["CDM", "CM"], price: 80000 },
  { id: 7,  name: "Jude Bellingham", rating: 91, nation: "England", league: "LaLiga", club: "Real Madrid", positions: ["CM", "CAM"], price: 120000 },
  { id: 8,  name: "Kevin De Bruyne", rating: 91, nation: "Belgium", league: "Premier League", club: "Manchester City", positions: ["CAM", "CM"], price: 95000 },
  { id: 9,  name: "Vinícius Jr.", rating: 90, nation: "Brazil", league: "LaLiga", club: "Real Madrid", positions: ["LW", "LM"], price: 130000 },
  { id: 10, name: "Erling Haaland", rating: 92, nation: "Norway", league: "Premier League", club: "Manchester City", positions: ["ST", "CF"], price: 200000 },
  { id: 11, name: "Mohamed Salah", rating: 90, nation: "Egypt", league: "Premier League", club: "Liverpool", positions: ["RW", "RM"], price: 110000 },
  { id: 1001, name: "Pelé", rating: 98, nation: "Brazil", league: "Icons", club: "Icons", positions: ["CAM", "CF", "ST"], isIcon: true },
  { id: 1002, name: "Yaya Touré", rating: 91, nation: "Ivory Coast", league: "Premier League", club: "Heroes", positions: ["CM", "CDM"], isHero: true },
];
