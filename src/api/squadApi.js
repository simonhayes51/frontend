// src/api/squadApi.js
import { normalizePositions } from "../utils/positions";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Enhanced caching with TTL
const defCache = new Map();
const priceCache = new Map();
const searchCache = new Map();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const isCacheValid = (t) => t && Date.now() - t < CACHE_TTL;

/** Slot-aware search: pass optional position filter (e.g., 'ST') */
export async function searchPlayers(query, positionFilter) {
  const q = (query || "").trim();
  const pos = (positionFilter || "").trim().toUpperCase();

  const key = `${q}::${pos}`;
  const cached = searchCache.get(key);
  if (cached && isCacheValid(cached.timestamp)) return cached.data;

  const url = new URL(`${API_BASE}/api/search-players`);
  if (q) url.searchParams.set("q", q);
  if (pos) url.searchParams.set("pos", pos);

  try {
    const r = await fetch(url.toString(), { credentials: "include" });
    if (!r.ok) return [];

    const { players = [] } = await r.json();

    const res = players.map((p) => ({
      id: Number(p.card_id),
      card_id: Number(p.card_id),
      name: p.name || "Unknown Player",
      rating: Number(p.rating) || 0,
      club: p.club || null,
      league: p.league || null,
      nation: p.nation || null,
      // backend now returns positions array; still normalize just in case
      positions: normalizePositions(p.positions || p.position || []),
      image_url: p.image_url || null,
      price: typeof p.price === "number" ? p.price : null,
      // ids can be added later if you add them server side
      clubId: p.clubId ?? null,
      leagueId: p.leagueId ?? null,
      nationId: p.nationId ?? null,
      isIcon: false,
      isHero: false,
    }));

    searchCache.set(key, { data: res, timestamp: Date.now() });
    return res;
  } catch (e) {
    console.error("searchPlayers failed:", e);
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
  if (!id) return null;

  const cached = defCache.get(id);
  if (cached && isCacheValid(cached.timestamp)) return cached.data;

  try {
    const r = await fetch(`${API_BASE}/api/fut-player-definition/${id}`, {
      credentials: "include",
    });
    if (!r.ok) return null;
    const json = await r.json();
    const def = json?.data || null;

    defCache.set(id, { data: def, timestamp: Date.now() });
    return def;
  } catch {
    return null;
  }
}

async function fetchLivePrice(cardId) {
  const id = Number(cardId);
  if (!id) return { current: null, isExtinct: false, updatedAt: null };

  const cached = priceCache.get(id);
  if (cached && isCacheValid(cached.timestamp)) return cached.data;

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
    priceCache.set(id, { data: out, timestamp: Date.now() });
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
  const n = (def?.name || "").toLowerCase();
  return {
    isIcon: rarity.includes("icon") || type.includes("icon") || n.includes("icon"),
    isHero: rarity.includes("hero") || type.includes("hero") || n.includes("hero"),
  };
}

/** Enrich a basic player (add image, fuller positions, price, special flags) */
export async function enrichPlayer(base) {
  const id = Number(base.card_id || base.id);
  if (!id) return base;

  const [def, live] = await Promise.all([fetchDefinition(id), fetchLivePrice(id)]);
  const positions = extractPositionsFromDef(def);
  const price = typeof live?.current === "number" ? live.current : base.price ?? null;
  const img = cardImageFromDef(def);
  const { isIcon, isHero } = detectSpecialCardType(def);

  return {
    ...base,
    id,
    card_id: id,
    positions: positions.length ? positions : base.positions,
    image_url: img || base.image_url || null,
    price,
    isIcon,
    isHero,
    isExtinct: !!live?.isExtinct,
    priceUpdatedAt: live?.updatedAt || null,
  };
}

// Utilities
export function clearPlayerCaches() {
  defCache.clear();
  priceCache.clear();
  searchCache.clear();
}
export function getCacheStats() {
  return {
    definitions: defCache.size,
    prices: priceCache.size,
    searches: searchCache.size,
  };
}