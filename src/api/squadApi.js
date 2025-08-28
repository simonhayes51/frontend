// src/api/squadApi.js
import { normalizePositions } from "../utils/positions";

const API_BASE = import.meta.env.VITE_API_URL || "";

const defCache = new Map();
const priceCache = new Map();

export async function searchPlayers(query) {
  const q = (query || "").trim();
  if (!q) return [];
  try {
    const r = await fetch(`${API_BASE}/api/search-players?q=${encodeURIComponent(q)}`, {
      credentials: "include",
    });
    if (!r.ok) return [];
    const { players = [] } = await r.json();

    return players.map((p) => ({
      id: Number(p.card_id),
      card_id: Number(p.card_id),
      name: p.name,
      rating: Number(p.rating) || 0,
      // Keep whatever DB gives; enrich will normalize/complete
      club: p.club || null,
      nation: p.nation || null,
      league: p.league || null,
      clubId: p.clubId || null,
      nationId: p.nationId || null,
      leagueId: p.leagueId || null,
      positions: normalizePositions(p.position ? [p.position] : []),
      image_url: p.image_url || null,
      price: typeof p.price === "number" ? p.price : null,
      isIcon: false,
      isHero: false,
    }));
  } catch {
    return [];
  }
}

function cardImageFromDef(def) {
  if (def?.futggCardImagePath) {
    return `https://game-assets.fut.gg/cdn-cgi/image/quality=90,format=auto,width=500/${def.futggCardImagePath}`;
  }
  if (def?.futggCardImage?.path) {
    return `https://game-assets.fut.gg/cdn-cgi/image/quality=90,format=auto,width=500/${def.futggCardImage.path}`;
  }
  return null;
}

async function fetchDefinition(cardId) {
  const id = Number(cardId);
  if (defCache.has(id)) return defCache.get(id);
  try {
    const r = await fetch(`${API_BASE}/api/fut-player-definition/${id}`, { credentials: "include" });
    const json = r.ok ? await r.json() : null;
    const def = json?.data || null;
    defCache.set(id, def);
    return def;
  } catch {
    return null;
  }
}

async function fetchLivePrice(cardId) {
  const id = Number(cardId);
  if (priceCache.has(id)) return priceCache.get(id);
  try {
    const r = await fetch(`${API_BASE}/api/fut-player-price/${id}`, { credentials: "include" });
    const json = r.ok ? await r.json() : null;
    const cur = json?.data?.currentPrice || {};
    const out = {
      current: typeof cur.price === "number" ? cur.price : null,
      isExtinct: !!cur.isExtinct,
      updatedAt: cur.priceUpdatedAt || null,
    };
    priceCache.set(id, out);
    return out;
  } catch {
    return { current: null, isExtinct: false, updatedAt: null };
  }
}

function extractPositionsFromDef(def) {
  const raw = [
    def?.preferredPosition1Name,
    def?.preferredPosition2Name,
    def?.preferredPosition3Name,
    def?.positionShort,
    def?.positionName,
    ...(Array.isArray(def?.preferredPositions) ? def.preferredPositions : []),
    ...(Array.isArray(def?.playablePositions) ? def.playablePositions : []),
  ].flat().filter(Boolean);
  return normalizePositions(raw);
}

// --- NEW: tolerant extraction helpers (name + id)
function pickLeague(def) {
  const obj = def?.league || {};
  const name =
    obj.name || obj.shortName || def?.leagueName || def?.leagueShortName || null;
  const id = obj.id || def?.leagueId || null;
  return { league: name, leagueId: id };
}
function pickClub(def) {
  const obj = def?.club || {};
  const name = obj.name || def?.clubName || null;
  const id = obj.id || def?.clubId || null;
  return { club: name, clubId: id };
}
function pickNation(def) {
  const obj = def?.nation || {};
  const name = obj.name || def?.nationName || null;
  const id = obj.id || def?.nationId || null;
  return { nation: name, nationId: id };
}

export async function enrichPlayer(base) {
  const id = Number(base.card_id || base.id);
  const [def, live] = await Promise.all([fetchDefinition(id), fetchLivePrice(id)]);

  const { league, leagueId } = pickLeague(def);
  const { club, clubId } = pickClub(def);
  const { nation, nationId } = pickNation(def);

  const positions = extractPositionsFromDef(def);
  const cardImage = cardImageFromDef(def);
  const price = typeof live?.current === "number" ? live.current : base.price ?? null;

  const rarity = (def?.rarity?.name || "").toLowerCase();
  const isIcon = rarity.includes("icon");
  const isHero = rarity.includes("hero");

  return {
    ...base,
    id,
    card_id: id,
    // prefer IDs from def; fall back to whatever we already had
    league: league || base.league || null,
    leagueId: leagueId ?? base.leagueId ?? null,
    club: club || base.club || null,
    clubId: clubId ?? base.clubId ?? null,
    nation: nation || base.nation || null,
    nationId: nationId ?? base.nationId ?? null,
    positions: positions.length ? positions : base.positions,
    image_url: cardImage || base.image_url || null,
    price,
    isIcon,
    isHero,
  };
}
