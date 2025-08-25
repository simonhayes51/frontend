import React, { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, Minus, Loader2, Target } from "lucide-react";

// Config: backend base (set VITE_API_URL to your backend URL)
const API_BASE = import.meta.env.VITE_API_URL || "";

// 🔹 tiny helper to build the proxy URL
const buildProxy = (url) => `${API_BASE}/img?url=${encodeURIComponent(url)}`;

// DB search via your backend
const searchPlayers = async (query) => {
  if (!query.trim()) return [];
  try {
    const r = await fetch(
      `${API_BASE}/api/search-players?q=${encodeURIComponent(query)}`,
      { credentials: "include" }
    );
    if (!r.ok) return [];
    const data = await r.json();
    return data.players || [];
  } catch (e) {
    console.error("Search failed:", e);
    return [];
  }
};

// FUT.GG: player definition via your backend proxy
const fetchPlayerDefinition = async (cardId) => {
  try {
    const response = await fetch(`${API_BASE}/api/fut-player-definition/${cardId}`, {
      credentials: "include"
    });
    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
  } catch (error) {
    console.error('Failed to fetch player definition:', error);
  }
  return null;
};

// FUT.GG: player price via your backend proxy
const fetchPlayerPrice = async (cardId) => {
  try {
    const response = await fetch(`${API_BASE}/api/fut-player-price/${cardId}`, {
      credentials: "include"
    });
    if (response.ok) {
      const data = await response.json();
      return {
        current: data.data?.currentPrice?.price || null,
        isExtinct: data.data?.currentPrice?.isExtinct || false,
        updatedAt: data.data?.currentPrice?.priceUpdatedAt || null,
        auctions: data.data?.completedAuctions || []
      };
    }
  } catch (error) {
    console.error('Failed to fetch price:', error);
  }
  return null;
};

// Helper functions
const getPositionName = (id) =>
  ({
    0: "GK",
    1: "RWB",
    2: "RB",
    3: "CB",
    4: "LB",
    5: "LWB",
    6: "CDM",
    7: "RM",
    8: "CM",
    9: "LM",
    10: "CAM",
    11: "RF",
    12: "CF",
    13: "LF",
    14: "RW",
    15: "ST",
    16: "LW",
  }[id] || "Unknown");

// ---- robust position resolver ----
const POS_CODE_TO_NAME = {
  0:"GK",1:"RWB",2:"RB",3:"CB",4:"LB",5:"LWB",6:"CDM",7:"RM",8:"CM",9:"LM",
  10:"CAM",11:"RF",12:"CF",13:"LF",14:"RW",15:"ST",16:"LW"
};

const _posNorm = (x) => {
  if (x == null) return null;
  if (typeof x === "number") return POS_CODE_TO_NAME[x] || null;
  if (typeof x === "string") {
    const s = x.trim().toUpperCase();
    if (!s) return null;
    // handle "ST,CAM,RW" or "ST | CAM | RW"
    const first = s.split(/[,\|/]+/)[0]?.trim();
    return first || null;
  }
  if (Array.isArray(x)) {
    // arrays of numbers or strings
    for (const v of x) {
      const t = _posNorm(v);
      if (t) return t;
    }
    return null;
  }
  if (typeof x === "object") {
    // nested shapes
    return (
      _posNorm(x.name) ||
      _posNorm(x.shortName) ||
      _posNorm(x.short) ||
      _posNorm(x.code) ||
      _posNorm(x.position) ||
      _posNorm(x.id)
    );
  }
  return null;
};

const resolvePosition = (pd, fallbackObj) => {
  const cands = [
    pd?.position,
    pd?.preferredPosition1,
    pd?.preferredPosition2,
    pd?.preferredPosition3,
    pd?.mainPosition,
    pd?.primaryPosition,
    pd?.bestPosition,
    pd?.basePosition,
    pd?.defaultPosition,
    pd?.positionId,
    pd?.positionName,
    pd?.preferredPosition1Name,
    pd?.shortPosition,
    // arrays / lists
    pd?.positions,
    pd?.preferredPositions,
    pd?.alternativePositions,
    pd?.altPositions,
    pd?.playablePositions,
    pd?.positionsList,
    pd?.positionList,
    // sometimes a comma string
    pd?.displayPositions,
    // fallbacks from the search-result object
    fallbackObj?.position,
    fallbackObj?.position_name,
    fallbackObj?.position_short,
    fallbackObj?.pos,
    fallbackObj?.positions,
  ];

  for (const c of cands) {
    const t = _posNorm(c);
    if (t) return t;
  }
  return "Unknown";

// ---- position resolver (drop this near your helpers) ----
const resolvePosition = (pd, fallback) => {
  const candidates = [
    pd?.position,
    pd?.preferredPosition1,
    pd?.preferredPosition2,
    pd?.preferredPosition3,
    pd?.mainPosition,
    pd?.primaryPosition,
    pd?.bestPosition,
    pd?.positionId,
    Array.isArray(pd?.positions) ? pd.positions[0] : null,
    Array.isArray(pd?.preferredPositions) ? pd.preferredPositions[0] : null,
    pd?.positionName,
    pd?.preferredPosition1Name,
  ];

  const normalize = (x) => {
    if (x == null) return null;
    if (typeof x === "string") return x.trim().toUpperCase() || null;
    if (typeof x === "number") return getPositionName(x);
    if (typeof x === "object") return normalize(x.name ?? x.position ?? x.id);
    return null;
  };

  for (const c of candidates) {
    const t = normalize(c);
    if (t) return t;
  }
  const fb = normalize(fallback);
  return fb || "Unknown";
};

// Color coding for attributes based on value (0-100)
const getAttributeColor = (value) => {
  if (value >= 90) return "text-green-400"; // Dark green
  if (value >= 80) return "text-green-300"; // Light green  
  if (value >= 70) return "text-yellow-300"; // Yellow
  if (value >= 60) return "text-orange-300"; // Amber
  return "text-red-400"; // Red
};

// Search box component
const SearchBox = ({ onPlayerSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setShowResults(false);
        return;
      }
      setLoading(true);
      const players = await searchPlayers(query);
      setResults(players);
      setLoading(false);
      setShowResults(true);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
        )}
        <input
          type="text"
          placeholder="Search players (e.g. Messi, Mbappé)..."
          className="w-full pl-10 pr-4 py-3 bg-[#1e293b] border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-lg text-white placeholder-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
        />
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-[#1e293b] border border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((player) => (
            <button
              key={`${player.card_id}-${player.rating}`}
              className="w-full px-4 py-3 text-left hover:bg-[#334155] border-b border-gray-700 last:border-b-0 focus:outline-none focus:bg-blue-500/20"
              onClick={() => {
                onPlayerSelect(player);
                setShowResults(false);
                setQuery('');
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-16 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {player.rating}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {player.name} ({player.rating})
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && !loading && query && results.length === 0 && (
        <div className="absolute z-10 w-full mt-2 bg-[#1e293b] border border-gray-600 rounded-lg shadow-lg p-4 text-center text-gray-400">
          No players found for "{query}"
        </div>
      )}
    </div>
  );
};

// Price trend component
const PriceTrend = ({ auctions }) => {
  if (!auctions || auctions.length < 2) return null;
  const [a, b] = auctions.slice(0, 2);
  const cur = a?.soldPrice;
  const prev = b?.soldPrice;
  if (!cur || !prev) return null;

  const change = cur - prev;
  const pct = ((change / prev) * 100).toFixed(2);

  return (
    <div className="flex items-center gap-2 text-sm">
      {change > 0 ? (
        <TrendingUp className="w-4 h-4 text-green-500" />
      ) : change < 0 ? (
        <TrendingDown className="w-4 h-4 text-red-500" />
      ) : (
        <Minus className="w-4 h-4 text-gray-400" />
      )}
      <span
        className={`font-medium ${
          change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-600"
        }`}
      >
        {pct}% {change > 0 ? `(+${change.toLocaleString()})` : `(${change.toLocaleString()})`}
      </span>
    </div>
  );
};

// Player detail component
const PlayerDetail = ({ player, onBack }) => {
  const [priceData, setPriceData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardId = player.card_id || player.id;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [priceInfo, defInfo] = await Promise.all([
        fetchPlayerPrice(cardId),
        fetchPlayerDefinition(cardId),
      ]);
      setPriceData(priceInfo);
      setPlayerData(defInfo);
      setLoading(false);
    })();
  }, [cardId]);

  const formatPrice = (p) => (p ? p.toLocaleString() : "N/A");

  const priceRange =
    priceData?.auctions?.length
      ? (() => {
          const prices = priceData.auctions.map((a) => a.soldPrice).filter(Boolean);
          if (!prices.length) return null;
          return { min: Math.min(...prices), max: Math.max(...prices) };
        })()
      : null;

  const d = {
    fullName:
      playerData?.commonName ||
      (playerData?.firstName && playerData?.lastName
        ? `${playerData.firstName} ${playerData.lastName}`
        : `${player.name} (${player.rating})`),
     position: resolvePosition(playerData, player),
    club: playerData?.club?.name || player.club || "Unknown",
    clubImage: playerData?.club?.imagePath 
      ? `https://game-assets.fut.gg/cdn-cgi/image/quality=100,format=auto,width=40/${playerData.club.imagePath}` 
      : "",
    nation: playerData?.nation?.name || player.nation || "Unknown",
    nationImage: playerData?.nation?.imagePath 
      ? `https://game-assets.fut.gg/cdn-cgi/image/quality=100,format=auto,width=40/${playerData.nation.imagePath}` 
      : "",
    league: playerData?.league?.name || "Unknown League",
    leagueImage: playerData?.league?.imagePath 
      ? `https://game-assets.fut.gg/cdn-cgi/image/quality=100,format=auto,width=40/${playerData.league.imagePath}` 
      : "",
    cardImage: playerData?.futggCardImagePath
      ? `https://game-assets.fut.gg/cdn-cgi/image/quality=90,format=auto,width=500/${playerData.futggCardImagePath}`
      : player.image_url,
    rating: playerData?.overall ?? player.rating,
    version: playerData?.rarity?.name || player.version || "Base",
    skillMoves: playerData?.skillMoves ?? 3,
    weakFoot: playerData?.weakFoot ?? 3,
    age: playerData?.dateOfBirth
      ? new Date().getFullYear() - new Date(playerData.dateOfBirth).getFullYear()
      : null,
    foot: playerData?.foot === 2 ? "Left" : "Right",
    accelerateType: playerData?.accelerateType || "Controlled",
    stats: {
      pace: playerData?.facePace || 0,
      shooting: playerData?.faceShooting || 0,
      passing: playerData?.facePassing || 0,
      dribbling: playerData?.faceDribbling || 0,
      defending: playerData?.faceDefending || 0,
      physicality: playerData?.facePhysicality || 0,
    },
    attributes: {
      acceleration: playerData?.attributeAcceleration || 0,
      sprintSpeed: playerData?.attributeSprintSpeed || 0,
      agility: playerData?.attributeAgility || 0,
      balance: playerData?.attributeBalance || 0,
      jumping: playerData?.attributeJumping || 0,
      stamina: playerData?.attributeStamina || 0,
      strength: playerData?.attributeStrength || 0,
      reactions: playerData?.attributeReactions || 0,
      aggression: playerData?.attributeAggression || 0,
      composure: playerData?.attributeComposure || 0,
      interceptions: playerData?.attributeInterceptions || 0,
      positioning: playerData?.attributePositioning || 0,
      vision: playerData?.attributeVision || 0,
      ballControl: playerData?.attributeBallControl || 0,
      crossing: playerData?.attributeCrossing || 0,
      dribbling: playerData?.attributeDribbling || 0,
      finishing: playerData?.attributeFinishing || 0,
      freeKickAccuracy: playerData?.attributeFkAccuracy || 0,
      headingAccuracy: playerData?.attributeHeadingAccuracy || 0,
      longPassing: playerData?.attributeLongPassing || 0,
      shortPassing: playerData?.attributeShortPassing || 0,
      shotPower: playerData?.attributeShotPower || 0,
      longShots: playerData?.attributeLongShots || 0,
      standingTackle: playerData?.attributeStandingTackle || 0,
      slidingTackle: playerData?.attributeSlidingTackle || 0,
      volleys: playerData?.attributeVolleys || 0,
      curve: playerData?.attributeCurve || 0,
      penalties: playerData?.attributePenalties || 0,
    },
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#0f172a]">
      <button onClick={onBack} className="mb-6 px-4 py-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
        ← Back to Search
      </button>

      <div className="bg-[#1e293b] border border-gray-700 text-white rounded-xl p-6">
        <div className="flex flex-col lg:flex-row items-start gap-6 mb-6">
          <div className="relative">
            <img
              src={d.cardImage}
              alt={d.fullName}
              className="w-48 h-64 object-cover rounded-lg"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // retry once via proxy, then fallback to whatever you already had
                if (!e.target.dataset.triedProxy) {
                  e.target.dataset.triedProxy = "1";
                  e.target.src = buildProxy(d.cardImage);
                }
              }}
            />
            <div className="absolute top-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-xs">
              {d.version}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{d.fullName}</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#334155] rounded-lg p-3">
                <div className="text-gray-400 text-sm mb-1">💰 Price</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin inline" />
                  ) : priceData?.isExtinct ? (
                    "Extinct"
                  ) : (
                    formatPrice(priceData?.current)
                  )}
                </div>
              </div>

              {priceRange && (
                <div className="bg-[#334155] rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Range</div>
                  <div className="font-medium">
                    {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                  </div>
                </div>
              )}

              <div className="bg-[#334155] rounded-lg p-3">
                <div className="text-gray-400 text-sm mb-1">Trend</div>
                <PriceTrend auctions={priceData?.auctions} />
              </div>

              <div className="bg-[#334155] rounded-lg p-3">
                <div className="text-gray-400 text-sm mb-1">AcceleRATE</div>
                <div className="font-medium text-green-400 text-xs leading-tight">{d.accelerateType.replace(/_/g, ' ')}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center bg-[#334155] rounded-lg p-3">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  {d.clubImage ? (
                    <img 
                      src={d.clubImage} 
                      alt={d.club} 
                      className="w-8 h-8 object-contain"
                      referrerPolicy="no-referrer"
                      onLoad={() => console.log('Club image loaded:', d.clubImage)}
                      onError={(e) => {
                        // try proxy once, then your existing placeholder
                        if (!e.target.dataset.triedProxy) {
                          e.target.dataset.triedProxy = "1";
                          e.target.src = buildProxy(d.clubImage);
                          return;
                        }
                        console.log('Club image failed to load:', d.clubImage);
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '<div class="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-xs">CLUB</div>';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-xs">
                      CLUB
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-400 mb-1">Club</div>
                <div className="font-medium text-sm">{d.club}</div>
              </div>

              <div className="text-center bg-[#334155] rounded-lg p-3">
                <div className="w-8 h-6 mx-auto mb-2 flex items-center justify-center">
                  {d.nationImage ? (
                    <img 
                      src={d.nationImage} 
                      alt={d.nation} 
                      className="w-8 h-6 object-contain"
                      referrerPolicy="no-referrer"
                      onLoad={() => console.log('Nation image loaded:', d.nationImage)}
                      onError={(e) => {
                        if (!e.target.dataset.triedProxy) {
                          e.target.dataset.triedProxy = "1";
                          e.target.src = buildProxy(d.nationImage);
                          return;
                        }
                        console.log('Nation image failed to load:', d.nationImage);
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '<div class="w-8 h-6 bg-gray-600 rounded flex items-center justify-center text-xs">NAT</div>';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-6 bg-gray-600 rounded flex items-center justify-center text-xs">
                      NAT
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-400 mb-1">Nation</div>
                <div className="font-medium text-sm">{d.nation}</div>
              </div>

              <div className="text-center bg-[#334155] rounded-lg p-3">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  {d.leagueImage ? (
                    <img 
                      src={d.leagueImage} 
                      alt={d.league} 
                      className="w-8 h-8 object-contain"
                      referrerPolicy="no-referrer"
                      onLoad={() => console.log('League image loaded:', d.leagueImage)}
                      onError={(e) => {
                        if (!e.target.dataset.triedProxy) {
                          e.target.dataset.triedProxy = "1";
                          e.target.src = buildProxy(d.leagueImage);
                          return;
                        }
                        console.log('League image failed to load:', d.leagueImage);
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '<div class="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-xs">LEG</div>';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-xs">
                      LEG
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-400 mb-1">League</div>
                <div className="font-medium text-sm">{d.league}</div>
              </div>

              <div className="text-center bg-[#334155] rounded-lg p-3">
                <Target className="w-6 h-6 mx-auto mb-2 text-red-400" />
                <div className="text-sm text-gray-400 mb-1">Position</div>
                <div className="font-medium">{d.position}</div>
              </div>
            </div>

            <div className="bg-[#334155] rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-3 text-lg">Player Stats</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Object.entries(d.stats).map(([stat, value]) => (
                  <div key={stat} className="text-center">
                    <div className={`text-2xl font-bold ${getAttributeColor(value)}`}>{value}</div>
                    <div className="text-xs text-gray-400 capitalize">{stat}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center bg-[#334155] rounded-lg p-3">
                <div className="text-lg font-semibold text-yellow-400">
                  {"⭐".repeat(d.skillMoves)}
                </div>
                <div className="text-xs text-gray-400">Skill Moves</div>
              </div>
              <div className="text-center bg-[#334155] rounded-lg p-3">
                <div className="text-lg font-semibold text-yellow-400">
                  {"⚽".repeat(d.weakFoot)}
                </div>
                <div className="text-xs text-gray-400">Weak Foot</div>
              </div>
              <div className="text-center bg-[#334155] rounded-lg p-3">
                <div className="text-sm font-semibold text-green-400">{d.age ? `${d.age} years` : 'Unknown'}</div>
                <div className="text-xs text-gray-400">Age</div>
              </div>
              <div className="text-center bg-[#334155] rounded-lg p-3">
                <div className="text-sm font-semibold text-blue-400">{d.foot}</div>
                <div className="text-xs text-gray-400">Preferred Foot</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#334155] rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3 text-lg">Detailed Attributes</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
            {Object.entries(d.attributes).map(
              ([attr, value]) =>
                value > 0 && (
                  <div
                    key={attr}
                    className="flex justify-between items-center bg-[#475569] rounded px-2 py-1"
                  >
                    <span className="text-gray-300 capitalize text-xs">
                      {attr.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className={`font-semibold ${getAttributeColor(value)}`}>{value}</span>
                  </div>
                )
            )}
          </div>
        </div>

        {priceData?.auctions?.length > 0 && (
          <div className="bg-[#334155] rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-lg">Recent Sales</h3>
            <div className="space-y-2">
              {priceData.auctions.slice(0, 5).map((a, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm bg-[#475569] rounded px-3 py-2">
                  <span className="text-gray-400">
                    {a.soldDate ? new Date(a.soldDate).toLocaleString() : "—"}
                  </span>
                  <span className="font-medium text-yellow-400">
                    {a.soldPrice ? a.soldPrice.toLocaleString() : "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {priceData?.updatedAt && (
          <div className="text-center text-gray-400 text-xs mt-4">
            Price updated: {new Date(priceData.updatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

// Main component
export default function PlayerSearch() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="container mx-auto">
        {!selectedPlayer ? (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-8">Player Search</h1>
            <SearchBox onPlayerSelect={setSelectedPlayer} />
            <p className="text-gray-400 mt-4">
              Search by player name to view live market data and detailed stats
            </p>
          </div>
        ) : (
          <PlayerDetail player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />
        )}
      </div>
    </div>
  );
}
