// src/api/squadApi.js
const API_BASE = import.meta.env.VITE_API_URL || "";

// --- tiny caches to avoid refetch spam during a session
const defCache = new Map();   // cardId -> definition payload
const priceCache = new Map(); // cardId -> { current, isExtinct, updatedAt }

/** Search players from your backend DB (fast). */
export async function searchPlayers(query) {
  const q = (query || "").trim();
  if (!q) return [];
  try {
    const r = await fetch(`${API_BASE}/api/search-players?q=${encodeURIComponent(q)}`, {
      credentials: "include",
    });
    if (!r.ok) return [];
    const { players = [] } = await r.json();

    // Normalize to the shape SquadBuilder & PlayerTile expect
    return players.map((p) => ({
      id: Number(p.card_id),             // <- important for DnD
      card_id: Number(p.card_id),
      name: p.name,
      rating: Number(p.rating) || 0,
      club: p.club || null,
      nation: p.nation || null,
      // We only know one position from DB; we’ll enrich later with more
      positions: p.position ? [String(p.position).toUpperCase()] : [],
      // initial image (can be upgraded by def)
      image_url: p.image_url || null,
      // price from DB if present; live price may override on enrich
      price: typeof p.price === "number" ? p.price : null,
      // league will be filled by enrich
      league: null,
      // convenience flags (could be enhanced by def if you want)
      isIcon: false,
      isHero: false,
    }));
  } catch {
    return [];
  }
}

/** Fetch & cache FUT.GG definition for a card (via your proxy). */
export async function fetchDefinition(cardId) {
  const id = Number(cardId);
  if (defCache.has(id)) return defCache.get(id);
  try {
    const r = await fetch(`${API_BASE}/api/fut-player-definition/${id}`, {
      credentials: "include",
    });
    const json = r.ok ? await r.json() : null;
    const def = json?.data || null;
    defCache.set(id, def);
    return def;
  } catch {
    return null;
  }
}

/** Fetch & cache FUT.GG live price for a card (via your proxy). */
export async function fetchLivePrice(cardId) {
  const id = Number(cardId);
  if (priceCache.has(id)) return priceCache.get(id);
  try {
    const r = await fetch(`${API_BASE}/api/fut-player-price/${id}`, {
      credentials: "include",
    });
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

/** Extract all usable positions from FUT.GG definition. */
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
    .map((x) => String(x).toUpperCase());

  // de-dup while keeping order
  return [...new Set(raw)];
}

/** Build a hi-res card image from FUT.GG definition if available. */
function cardImageFromDef(def) {
  const p = def?.futggCardImagePath;
  if (!p) return null;
  return `https://game-assets.fut.gg/cdn-cgi/image/quality=90,format=auto,width=500/${p}`;
}

/** Enrich a searched player with league, alt positions, hi-res image & live price. */
export async function enrichPlayer(base) {
  const id = Number(base.card_id || base.id);
  const [def, live] = await Promise.all([fetchDefinition(id), fetchLivePrice(id)]);

  const league = def?.league?.name || null;
  const positions = positionsFromDef(def);
  const cardImage = cardImageFromDef(def);

  // Keep DB price if live missing
  const price = typeof live?.current === "number" ? live.current : base.price ?? null;

  // Icon / Hero flags (optional)
  const rarity = def?.rarity?.name?.toLowerCase?.() || "";
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
  };
}
