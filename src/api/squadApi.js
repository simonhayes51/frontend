// src/api/squadApi.js
import { normalizePositions, isValidForSlot } from "../utils/positions";

const API_BASE = import.meta.env.VITE_API_URL || "";

// simple in-memory caches with TTL
const TTL = 5 * 60 * 1000;
const searchCache = new Map(); // key -> {ts,data}
const defCache = new Map();    // cardId -> {ts,data}
const priceCache = new Map();  // cardId -> {ts,data}

const fresh = (x) => x && Date.now() - x.ts < TTL;

export async function searchPlayers(query, slotPos) {
  const q = (query || "").trim();
  if (!q) return [];

  const key = `${q.toLowerCase()}|${slotPos || ""}`;
  const hit = searchCache.get(key);
  if (fresh(hit)) return hit.data;

  const url = new URL(`${API_BASE}/api/search-players`);
  url.searchParams.set("q", q);
  if (slotPos) url.searchParams.set("pos", slotPos); // backend may ignore; we also filter client-side

  let players = [];
  try {
    const r = await fetch(url.toString(), { credentials: "include" });
    if (r.ok) {
      const { players: raw = [] } = await r.json();

      players = raw.map((p) => {
        // p.position (primary) + p.altposition (CSV or single); normalize to array of canonical codes
        const alt = p.altposition
          ? Array.isArray(p.altposition)
            ? p.altposition
            : String(p.altposition).split(/[;,|/]/)
          : [];
        const positions = normalizePositions([p.position, ...alt]);

        return {
          id: Number(p.card_id),
          card_id: Number(p.card_id),
          name: p.name || "Unknown",
          rating: Number(p.rating) || 0,
          version: p.version || null,
          image_url: p.image_url || null,

          // entity names from DB (IDs optional; chemistry can work with names alone)
          club: p.club || null,
          nation: p.nation || null,
          league: p.league || null,

          // allow IDs if you later add them (chemistry.js will use names when IDs absent)
          clubId: p.clubId ?? null,
          nationId: p.nationId ?? null,
          leagueId: p.leagueId ?? null,

          positions,
          price: typeof p.price === "number" ? p.price : null,

          // flags (will be refined by enrich)
          isIcon: false,
          isHero: false,
        };
      });

      // client-side filter by slot eligibility as a fallback
      if (slotPos) {
        players = players.filter((p) => isValidForSlot(slotPos, p.positions));
      }
    }
  } catch (e) {
    console.warn("searchPlayers failed:", e);
  }

  searchCache.set(key, { ts: Date.now(), data: players });
  return players;
}

function cardImg(def) {
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
  const hit = defCache.get(id);
  if (fresh(hit)) return hit.data;

  try {
    const r = await fetch(`${API_BASE}/api/fut-player-definition/${id}`, { credentials: "include" });
    const json = r.ok ? await r.json() : null;
    const def = json?.data || null;
    defCache.set(id, { ts: Date.now(), data: def });
    return def;
  } catch {
    return null;
  }
}

async function fetchLivePrice(cardId) {
  const id = Number(cardId);
  if (!id) return { current: null, isExtinct: false, updatedAt: null };
  const hit = priceCache.get(id);
  if (fresh(hit)) return hit.data;

  try {
    const r = await fetch(`${API_BASE}/api/fut-player-price/${id}`, { credentials: "include" });
    const json = r.ok ? await r.json() : null;
    const cur = json?.data?.currentPrice || {};
    const out = {
      current: typeof cur.price === "number" ? cur.price : null,
      isExtinct: !!cur.isExtinct,
      updatedAt: cur.priceUpdatedAt || null,
    };
    priceCache.set(id, { ts: Date.now(), data: out });
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
  ].filter(Boolean);
  return normalizePositions(raw);
}

export async function enrichPlayer(base) {
  const id = Number(base.card_id || base.id);
  if (!id) return base;

  const [def, live] = await Promise.all([fetchDefinition(id), fetchLivePrice(id)]);

  const positions = (() => {
    const fromDef = extractPositionsFromDef(def);
    return fromDef.length ? fromDef : base.positions || [];
  })();

  const image_url = cardImg(def) || base.image_url || null;

  const league = def?.league?.name || base.league || null;
  const leagueId = def?.league?.id ?? base.leagueId ?? null;
  const club = def?.club?.name || base.club || null;
  const clubId = def?.club?.id ?? base.clubId ?? null;
  const nation = def?.nation?.name || base.nation || null;
  const nationId = def?.nation?.id ?? base.nationId ?? null;

  const rarity = (def?.rarity?.name || "").toLowerCase();
  const isIcon = rarity.includes("icon");
  const isHero = rarity.includes("hero");

  const price = typeof live?.current === "number" ? live.current : base.price ?? null;

  return {
    ...base,
    positions,
    image_url,
    league, leagueId,
    club, clubId,
    nation, nationId,
    isIcon, isHero,
    price,
    isExtinct: !!live?.isExtinct,
    priceUpdatedAt: live?.updatedAt || null,
  };
}