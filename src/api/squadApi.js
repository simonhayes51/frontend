// src/api/squadApi.js
const API_BASE = import.meta.env.VITE_API_URL || "";

// ---------- in-memory caches ----------
const defCache = new Map();   // cardId -> fut.gg definition object
const priceCache = new Map(); // cardId -> { current, isExtinct, updatedAt }

// ---------- SEARCH (from your DB) ----------
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
      club: p.club || null,
      nation: p.nation || null,
      positions: p.position ? [String(p.position).toUpperCase()] : [],
      image_url: p.image_url || null, // will be upgraded by def if available
      price: typeof p.price === "number" ? p.price : null, // fallback if live missing
      league: null,
      isIcon: false,
      isHero: false,
    }));
  } catch {
    return [];
  }
}

// ---------- FUT.GG proxies (definition + price) ----------
function pickDef(json) {
  // Some responses are { data: {...} }, others just {...}
  return json && (json.data || json);
}

export async function fetchDefinition(cardId) {
  const id = Number(cardId);
  if (defCache.has(id)) return defCache.get(id);
  try {
    const r = await fetch(`${API_BASE}/api/fut-player-definition/${id}`, { credentials: "include" });
    const json = r.ok ? await r.json() : null;
    const def = pickDef(json) || null;
    defCache.set(id, def);
    return def;
  } catch {
    return null;
  }
}

export async function fetchLivePrice(cardId) {
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

// ---------- helpers from definition ----------
function positionsFromDef(def) {
  const raw = [
    def?.preferredPosition1Name,
    def?.preferredPosition2Name,
    def?.preferredPosition3Name,
    def?.positionShort,
    def?.positionName,
    ...(Array.isArray(def?.preferredPositions) ? def.preferredPositions : []),
    ...(Array.isArray(def?.playablePositions) ? def.playablePositions : []),
  ]
    .flat()
    .filter(Boolean)
    .map((x) => String(x).toUpperCase().trim());

  return [...new Set(raw)];
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

// ---------- enrich a selected player ----------
export async function enrichPlayer(base) {
  const id = Number(base.card_id || base.id);
  const [def, live] = await Promise.all([fetchDefinition(id), fetchLivePrice(id)]);

  const league = def?.league?.name || base.league || null;
  const positions = positionsFromDef(def);
  const cardImage = cardImageFromDef(def);
  const price = typeof live?.current === "number" ? live.current : base.price ?? null;

  const rarity = (def?.rarity?.name || "").toLowerCase();
  const isIcon = rarity.includes("icon");
  const isHero = rarity.includes("hero");

  return {
    ...base,
    id,
    card_id: id,
    league,
    positions: positions.length ? positions : base.positions,
    image_url: cardImage || base.image_url || null,
    price,
    isIcon,
    isHero,
    club: base.club || def?.club?.name || null,
    nation: base.nation || def?.nation?.name || null,
  };
}
