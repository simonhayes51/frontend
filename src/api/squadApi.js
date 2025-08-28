// src/api/squadApi.js
import { normalizePositions } from "../utils/positions";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Enhanced caching with TTL
const defCache = new Map();
const priceCache = new Map();
const searchCache = new Map();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(timestamp) {
  return timestamp && (Date.now() - timestamp) < CACHE_TTL;
}

export async function searchPlayers(query) {
  const q = (query || "").trim();
  if (!q) return [];
  
  // Check search cache
  const cacheKey = q.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }

  try {
    const r = await fetch(`${API_BASE}/api/search-players?q=${encodeURIComponent(q)}`, {
      credentials: "include",
    });
    
    if (!r.ok) {
      console.warn(`Search API returned ${r.status}: ${r.statusText}`);
      return [];
    }
    
    const { players = [] } = await r.json();

    const results = players.map((p) => ({
      id: Number(p.card_id),
      card_id: Number(p.card_id),
      name: p.name || "Unknown Player",
      rating: Number(p.rating) || 0,
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

    // Cache successful results
    searchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    return results;
  } catch (error) {
    console.error("Search players failed:", error);
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
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }

  try {
    const r = await fetch(`${API_BASE}/api/fut-player-definition/${id}`, { 
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!r.ok) {
      console.warn(`Definition API returned ${r.status} for player ${id}`);
      return null;
    }
    
    const json = await r.json();
    const def = json?.data || null;
    
    // Cache with timestamp
    defCache.set(id, {
      data: def,
      timestamp: Date.now()
    });
    
    return def;
  } catch (error) {
    console.error(`Failed to fetch definition for player ${id}:`, error);
    return null;
  }
}

async function fetchLivePrice(cardId) {
  const id = Number(cardId);
  if (!id) return { current: null, isExtinct: false, updatedAt: null };
  
  const cached = priceCache.get(id);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }

  try {
    const r = await fetch(`${API_BASE}/api/fut-player-price/${id}`, { 
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!r.ok) {
      console.warn(`Price API returned ${r.status} for player ${id}`);
      return { current: null, isExtinct: false, updatedAt: null };
    }
    
    const json = await r.json();
    const cur = json?.data?.currentPrice || {};
    
    const result = {
      current: typeof cur.price === "number" ? cur.price : null,
      isExtinct: !!cur.isExtinct,
      updatedAt: cur.priceUpdatedAt || null,
    };
    
    // Cache with timestamp
    priceCache.set(id, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to fetch price for player ${id}:`, error);
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

// Enhanced entity extraction with better fallbacks
function pickLeague(def) {
  const obj = def?.league || {};
  const name = obj.name || obj.shortName || def?.leagueName || def?.leagueShortName || null;
  const id = obj.id || def?.leagueId || null;
  return { league: name, leagueId: id };
}

function pickClub(def) {
  const obj = def?.club || {};
  const name = obj.name || obj.shortName || def?.clubName || def?.clubShortName || null;
  const id = obj.id || def?.clubId || null;
  return { club: name, clubId: id };
}

function pickNation(def) {
  const obj = def?.nation || {};
  const name = obj.name || obj.shortName || def?.nationName || def?.nationShortName || null;
  const id = obj.id || def?.nationId || null;
  return { nation: name, nationId: id };
}

// Enhanced special card detection
function detectSpecialCardType(def) {
  const rarity = (def?.rarity?.name || "").toLowerCase();
  const cardType = (def?.cardType || "").toLowerCase();
  const cardName = (def?.name || "").toLowerCase();
  
  const isIcon = rarity.includes("icon") || cardType.includes("icon") || cardName.includes("icon");
  const isHero = rarity.includes("hero") || cardType.includes("hero") || cardName.includes("hero");
  
  return { isIcon, isHero };
}

export async function enrichPlayer(base) {
  const id = Number(base.card_id || base.id);
  if (!id) {
    console.warn("Cannot enrich player without valid ID:", base);
    return base;
  }

  try {
    const [def, live] = await Promise.all([
      fetchDefinition(id), 
      fetchLivePrice(id)
    ]);

    const { league, leagueId } = pickLeague(def);
    const { club, clubId } = pickClub(def);
    const { nation, nationId } = pickNation(def);

    const positions = extractPositionsFromDef(def);
    const cardImage = cardImageFromDef(def);
    const price = typeof live?.current === "number" ? live.current : base.price ?? null;

    const { isIcon, isHero } = detectSpecialCardType(def);

    return {
      ...base,
      id,
      card_id: id,
      // Enhanced data with better fallbacks
      league: league || base.league || null,
      leagueId: leagueId ?? base.leagueId ?? null,
      club: club || base.club || null,
      clubId: clubId ?? base.clubId ?? null,
      nation: nation || base.nation || null,
      nationId: nationId ?? base.nationId ?? null,
      positions: positions.length ? positions : base.positions || [],
      image_url: cardImage || base.image_url || null,
      price,
      isIcon,
      isHero,
      // Additional metadata
      isExtinct: live?.isExtinct || false,
      priceUpdatedAt: live?.updatedAt || null,
      lastEnriched: Date.now(),
    };
  } catch (error) {
    console.error(`Failed to enrich player ${id}:`, error);
    // Return base player data if enrichment fails
    return {
      ...base,
      id,
      card_id: id,
      isIcon: false,
      isHero: false,
      lastEnriched: Date.now(),
    };
  }
}

// Cache management utilities
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

// Batch operations for performance
export async function enrichPlayers(players) {
  if (!Array.isArray(players) || players.length === 0) return [];
  
  try {
    const enrichedPlayers = await Promise.allSettled(
      players.map(player => enrichPlayer(player))
    );
    
    return enrichedPlayers
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  } catch (error) {
    console.error("Batch enrichment failed:", error);
    return players; // Return original data if batch enrichment fails
  }
}

// Export cache utilities for debugging
export const __debug = {
  defCache,
  priceCache, 
  searchCache,
  clearCaches: clearPlayerCaches,
  getCacheStats,
};
