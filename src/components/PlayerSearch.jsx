import React, { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, Minus, Loader2, Target } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

// 🔹 FUT.GG image builder
const FUTGG_IMG_PREFIX =
  "https://game-assets.fut.gg/cdn-cgi/image/quality=100,format=auto,width=";

function futggImgUrl(imagePath, width = 80) {
  if (!imagePath) return "";
  return `${FUTGG_IMG_PREFIX}${width}/${imagePath}`;
}

// 🔹 Safe image component with proxy fallback
const FutGGImage = ({ path, width = 40, alt = "" }) => {
  const [useProxy, setUseProxy] = useState(false);
  if (!path) return null;

  const directUrl = futggImgUrl(path, width);
  const proxyUrl = `${API_BASE}/img?url=${encodeURIComponent(directUrl)}`;

  return (
    <img
      src={useProxy ? proxyUrl : directUrl}
      alt={alt}
      width={width}
      height={width}
      className="object-contain"
      referrerPolicy={useProxy ? undefined : "no-referrer"}
      onError={() => setUseProxy(true)}
    />
  );
};

// 🔹 API fetch helpers
const searchPlayers = async (query) => {
  if (!query.trim()) return [];
  try {
    const r = await fetch(`${API_BASE}/api/search-players?q=${encodeURIComponent(query)}`, {
      credentials: "include",
    });
    if (!r.ok) return [];
    const data = await r.json();
    return data.players || [];
  } catch (e) {
    console.error("Search failed:", e);
    return [];
  }
};

const fetchPlayerDefinition = async (cardId) => {
  try {
    const response = await fetch(`${API_BASE}/api/fut-player-definition/${cardId}`, {
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
  } catch (error) {
    console.error("Failed to fetch player definition:", error);
  }
  return null;
};

const fetchPlayerPrice = async (cardId) => {
  try {
    const response = await fetch(`${API_BASE}/api/fut-player-price/${cardId}`, {
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return {
        current: data.data?.currentPrice?.price || null,
        isExtinct: data.data?.currentPrice?.isExtinct || false,
        updatedAt: data.data?.currentPrice?.priceUpdatedAt || null,
        auctions: data.data?.completedAuctions || [],
      };
    }
  } catch (error) {
    console.error("Failed to fetch price:", error);
  }
  return null;
};

// 🔹 Helpers
const getPositionName = (id) =>
  (
    {
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
    }[id] || "Unknown"
  );

const getAttributeColor = (value) => {
  if (value >= 90) return "text-green-400";
  if (value >= 80) return "text-green-300";
  if (value >= 70) return "text-yellow-300";
  if (value >= 60) return "text-orange-300";
  return "text-red-400";
};

// 🔹 Search box
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
                setQuery("");
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

// 🔹 Price trend
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
          change > 0
            ? "text-green-600"
            : change < 0
            ? "text-red-600"
            : "text-gray-600"
        }`}
      >
        {pct}% {change > 0 ? `(+${change.toLocaleString()})` : `(${change.toLocaleString()})`}
      </span>
    </div>
  );
};

// 🔹 Player detail
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
          const prices = priceData.auctions
            .map((a) => a.soldPrice)
            .filter(Boolean);
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
    position:
      getPositionName(playerData?.position || playerData?.preferredPosition1) ||
      "Unknown",
    club: playerData?.club?.name || player.club || "Unknown",
    clubPath: playerData?.club?.imagePath,
    nation: playerData?.nation?.name || player.nation || "Unknown",
    nationPath: playerData?.nation?.imagePath,
    league: playerData?.league?.name || "Unknown League",
    leaguePath: playerData?.league?.imagePath,
    cardPath: playerData?.futggCardImagePath,
    rating: playerData?.overall ?? player.rating,
    version: playerData?.rarity?.name || player.version || "Base",
    skillMoves: playerData?.skillMoves ?? 3,
    weakFoot: playerData?.weakFoot ?? 3,
    age: playerData?.dateOfBirth
      ? new Date().getFullYear() -
        new Date(playerData.dateOfBirth).getFullYear()
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
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
      >
        ← Back to Search
      </button>

      <div className="bg-[#1e293b] border border-gray-700 text-white rounded-xl p-6">
        <div className="flex flex-col lg:flex-row items-start gap-6 mb-6">
          <div className="relative">
            <FutGGImage
              path={d.cardPath}
              width={500}
              alt={d.fullName}
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
                <div className="font-medium text-green-400 text-xs leading-tight">
                  {d.accelerateType.replace(/_/g, " ")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center bg-[#334155] rounded-lg p-3">
                <FutGGImage path={d.clubPath} width={40} alt={d.club} />
                <div className="text-sm text-gray-400 mb-1">Club</div>
                <div className="font-medium text-sm">{d.club}</div>
              </div>

              <div className="text-center bg-[#334155] rounded-lg p-3">
                <FutGGImage path={d.nationPath} width={40} alt={d.nation} />
                <div className="text-sm text-gray-400 mb-1">Nation</div>
                <div className="font-medium text-sm">{d.nation}</div>
              </div>

              <div className="text-center bg-[#334155] rounded-lg p-3">
                <FutGGImage path={d.leaguePath} width={40} alt={d.league} />
                <div className="text-sm text-gray-400 mb-1">League</div>
                <div className="font-medium text-sm">{d.league}</div>
              </div>

              <div className="text-center bg-[#334155] rounded-lg p-3">
                <Target className="w-6 h-6 mx-auto mb-2 text-red-400" />
                <div className="text-sm text-gray-400 mb-1">Position</div>
                <div className="font-medium">{d.position}</div>
              </div>
            </div>

            {/* Stats + Attributes etc (unchanged) */}
            {/* ... keep your existing stats/attributes code here ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

// 🔹 Main component
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
          <PlayerDetail
            player={selectedPlayer}
            onBack={() => setSelectedPlayer(null)}
          />
       
