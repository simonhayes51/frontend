// src/api/squadApi.js
import { normalizePositions } from "../utils/positions";

const API_BASE = import.meta.env.VITE_API_URL || "";

// simple TTL caches
const defCache = new Map();    // id -> { data, ts }
const priceCache = new Map();  // id -> { data, ts }
const searchCache = new Map(); // q  -> { data, ts }
const TTL = 5 * 60 * 1000;

const valid = (ts) => ts && Date.now() - ts < TTL;

/** DB-driven search: includes ids + positions[] + ids for club/nation/league */
export async function searchPlayers(query) {
  const q = (query || "").trim();
  if (!q) return [];
  const key = q.toLowerCase();
  const cached = searchCache.get(key);
  if (cached && valid(cached.ts)) return cached.data;

  try {
    const r = await fetch(`${API_BASE}/api/search-players?q=${encodeURIComponent(q)}`, {
      credentials: "include",
    });
    if (!r.ok) return [];
    const { players = [] } = await r.json();

    const out = players.map((p) => ({
      id: Number(p.card_id),
      card_id: Number(p.card_id),
      name: p.name || "Unknown Player",
      rating: Number(p.rating) || 0,
      image_url: p.image_url || null,
      price: typeof p.price === "number" ? p.price : null,

      clubId: p.clubId ?? p.club_id ?? null,
      club: p.club ?? null,
      nationId: p.nationId ?? p.nation_id ?? null,
      nation: p.nation ?? null,
      leagueId: p.leagueId ?? p.league_id ?? null,
      league: p.league ?? null,

      positions: normalizePositions(p.positions || []),

      isIcon: !!p.isIcon,
      isHero: !!p.isHero,
    }));

    searchCache.set(key, { data: out, ts: Date.now() });
    return out;
  } catch {
    return [];
  }
}

/* ---- enrichment helpers (nice images + live price) ---- */

function futggCardImage(def) {
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
  if (!id) return null;
  const c = defCache.get(id);
  if (c && valid(c.ts)) return c.data;

  try {
    const r = await fetch(`${API_BASE}/api/fut-player-definition/${id}`, {
      credentials: "include",
    });
    if (!r.ok) return null;
    const json = await r.json();
    const def = json?.data || null;
    defCache.set(id, { data: def, ts: Date.now() });
    return def;
  } catch {
    return null;
  }
}

async function fetchLivePrice(cardId) {
  const id = Number(cardId);
  if (!id) return { current: null, isExtinct: false, updatedAt: null };
  const c = priceCache.get(id);
  if (c && valid(c.ts)) return c.data;

  try {
    const r = await fetch(`${API_BASE}/api/fut-player-price/${id}`, {
      credentials: "include",
    });
    if (!r.ok) return { current: null, isExtinct: false, updatedAt: null };
    const json = await r.json();
    const cur = json?.data?.currentPrice || {};
    const out = {
      current: typeof cur.price === "number" ? cur.price : null,
      isExtinct: !!cur.isExtinct,
      updatedAt: cur.priceUpdatedAt || null,
    };
    priceCache.set(id, { data: out, ts: Date.now() });
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

function detectSpecialCardType(def) {
  const rarity = (def?.rarity?.name || "").toLowerCase();
  const type = (def?.cardType || "").toLowerCase();
  return {
    isIcon: rarity.includes("icon") || type.includes("icon"),
    isHero: rarity.includes("hero") || type.includes("hero"),
  };
}

/** Cosmetic enrichment (images, live price). Chemistry does NOT depend on this. */
export async function enrichPlayer(base) {
  const id = Number(base.card_id || base.id);
  if (!id) return base;

  const [def, live] = await Promise.all([fetchDefinition(id), fetchLivePrice(id)]);

  const positions = extractPositionsFromDef(def);
  const img = futggCardImage(def);
  const price = typeof live?.current === "number" ? live.current : base.price ?? null;
  const special = detectSpecialCardType(def);

  const league = def?.league?.name || base.league || null;
  const leagueId = def?.league?.id ?? base.leagueId ?? null;
  const club = def?.club?.name || base.club || null;
  const clubId = def?.club?.id ?? base.clubId ?? null;
  const nation = def?.nation?.name || base.nation || null;
  const nationId = def?.nation?.id ?? base.nationId ?? null;

  return {
    ...base,
    id,
    card_id: id,
    image_url: img || base.image_url || null,
    positions: positions.length ? positions : base.positions,
    price,
    league, leagueId,
    club, clubId,
    nation, nationId,
    ...special,
    isExtinct: !!live?.isExtinct,
    priceUpdatedAt: live?.updatedAt || null,
  };
}