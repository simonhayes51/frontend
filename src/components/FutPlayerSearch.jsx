import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, Loader2, Users, MapPin, Target } from 'lucide-react';

// Enhanced data fetching functions
const fetchPlayerDefinition = async (cardId) => {
  try {
    const response = await fetch(`https://www.fut.gg/api/fut/player-item-definitions/25/${cardId}/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json, text/plain, */*", 
        "Accept-Language": "en-GB,en;q=0.9",
        "Referer": "https://www.fut.gg/",
        "Origin": "https://www.fut.gg"
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data; // Return the player definition data
    }
  } catch (error) {
    console.error('Failed to fetch player definition:', error);
  }
  return null;
};

// Position mapping for display
const getPositionName = (positionId) => {
  const positions = {
    0: 'GK', 1: 'RWB', 2: 'RB', 3: 'CB', 4: 'LB', 5: 'LWB',
    6: 'CDM', 7: 'RM', 8: 'CM', 9: 'LM', 10: 'CAM',
    11: 'RF', 12: 'CF', 13: 'LF', 14: 'RW', 15: 'ST', 16: 'LW'
  };
  return positions[positionId] || 'Unknown';
};

// Work rate mapping
const getWorkRate = (workRateId) => {
  const workRates = {
    0: 'Low', 1: 'Medium', 2: 'High'
  };
  return workRates[workRateId] || 'Medium';
};

// Price fetching function
const fetchPlayerPrice = async (cardId) => {
  try {
    const response = await fetch(`https://www.fut.gg/api/fut/player-prices/25/${cardId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-GB,en;q=0.9",
        "Referer": "https://www.fut.gg/",
        "Origin": "https://www.fut.gg"
      }
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

// Search players from your backend API
const searchPlayers = async (query) => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(`/api/search-players?q=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      return data.players || [];
    }
  } catch (error) {
    console.error('Search failed:', error);
  }
  return [];
};

// Search component
const PlayerSearch = ({ onPlayerSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    
    setLoading(true);
    const players = await searchPlayers(searchQuery);
    setResults(players);
    setLoading(false);
    setShowResults(true);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
        )}
        <input
          type="text"
          placeholder="Search players (e.g. Messi, Mbappé)..."
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onFocus={() => setShowResults(true)}
        />
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((player) => (
            <button
              key={`${player.card_id}-${player.rating}`}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
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
                  <div className="font-semibold text-gray-900">
                    {player.name} ({player.rating})
                  </div>
                  <div className="text-sm text-gray-600">
                    {player.version} • {player.club} • {player.position}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && !loading && query && results.length === 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No players found for "{query}"
        </div>
      )}
    </div>
  );
};

// Price trend component
const PriceTrend = ({ auctions }) => {
  if (!auctions || auctions.length < 2) return null;

  const recent = auctions.slice(0, 2);
  const current = recent[0]?.soldPrice;
  const previous = recent[1]?.soldPrice;
  
  if (!current || !previous) return null;

  const change = current - previous;
  const changePercent = ((change / previous) * 100).toFixed(2);
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      {isPositive && <TrendingUp className="w-4 h-4 text-green-500" />}
      {isNegative && <TrendingDown className="w-4 h-4 text-red-500" />}
      {!isPositive && !isNegative && <Minus className="w-4 h-4 text-gray-400" />}
      
      <span className={`font-medium ${
        isPositive ? 'text-green-600' : 
        isNegative ? 'text-red-600' : 
        'text-gray-600'
      }`}>
        {changePercent}% ({isPositive ? '+' : ''}{change.toLocaleString()})
      </span>
    </div>
  );
};

// Player detail component
const PlayerDetail = ({ player, onBack }) => {
  const [priceData, setPriceData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlayerData = async () => {
      setLoading(true);
      
      // Fetch both price and player definition data concurrently
      const [priceInfo, playerInfo] = await Promise.all([
        fetchPlayerPrice(player.card_id),
        fetchPlayerDefinition(player.card_id)
      ]);
      
      setPriceData(priceInfo);
      setPlayerData(playerInfo);
      setLoading(false);
    };
    
    loadPlayerData();
  }, [player.card_id]);

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return price.toLocaleString();
  };

  const getPriceRange = (auctions) => {
    if (!auctions || auctions.length === 0) return null;
    const prices = auctions.map(a => a.soldPrice).filter(Boolean);
    if (prices.length === 0) return null;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max };
  };

  const priceRange = getPriceRange(priceData?.auctions);

  // Use fetched player data if available, otherwise fallback to basic data
  const displayData = {
    fullName: playerData?.commonName || `${playerData?.firstName} ${playerData?.lastName}` || `${player.name} (${player.rating})`,
    firstName: playerData?.firstName || player.name.split(' ')[0],
    lastName: playerData?.lastName || player.name,
    position: getPositionName(playerData?.position) || player.position,
    club: playerData?.club?.name || player.club,
    clubImage: playerData?.club?.imageUrl || `/api/placeholder/50/50`,
    nation: playerData?.nation?.name || player.nation,
    nationImage: playerData?.nation?.imageUrl || `/api/placeholder/50/50`,
    league: playerData?.league?.name || 'Unknown League',
    leagueImage: playerData?.league?.imageUrl || `/api/placeholder/50/50`,
    cardImage: playerData?.futggCardImagePath ? `https://game-assets.fut.gg/cdn-cgi/image/quality=90,format=auto,width=500/${playerData.futggCardImagePath}` : player.image_url,
    simpleCardImage: playerData?.simpleCardImagePath ? `https://game-assets.fut.gg/cdn-cgi/image/quality=90,format=auto,width=300/${playerData.simpleCardImagePath}` : player.image_url,
    rating: playerData?.overall || player.rating,
    version: playerData?.rarity?.name || player.version || 'Base',
    rarityColor: playerData?.rarity?.dominantColor || '000000',
    height: playerData?.height || null,
    weight: playerData?.weight || null,
    skillMoves: playerData?.skillMoves || 3,
    weakFoot: playerData?.weakFoot || 3,
    attackingWorkRate: getWorkRate(playerData?.attackingWorkrate),
    defensiveWorkRate: getWorkRate(playerData?.defensiveWorkrate),
    age: playerData?.dateOfBirth ? new Date().getFullYear() - new Date(playerData.dateOfBirth).getFullYear() : null,
    foot: playerData?.foot === 1 ? 'Right' : playerData?.foot === 2 ? 'Left' : 'Right',
    accelerateType: playerData?.accelerateType || 'Controlled',
    shirtNumber: playerData?.shirtNumber || null,
    
    // Face stats (FIFA's 6 main stats)
    stats: {
      pace: playerData?.facePace || 0,
      shooting: playerData?.faceShooting || 0,
      passing: playerData?.facePassing || 0,
      dribbling: playerData?.faceDribbling || 0,
      defending: playerData?.faceDefending || 0,
      physicality: playerData?.facePhysicality || 0
    },

    // Individual attributes for detailed view
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
      penalties: playerData?.attributePenalties || 0
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Search
      </button>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl p-6">
        <div className="flex flex-col lg:flex-row items-start gap-6 mb-6">
          <div className="relative">
            <img
              src={displayData.cardImage}
              alt={displayData.fullName}
              className="w-48 h-64 object-cover rounded-lg shadow-lg"
              style={{ backgroundColor: `#${displayData.rarityColor}` }}
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-lg font-bold">
              {displayData.rating}
            </div>
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
              {displayData.version}
            </div>
            {displayData.shirtNumber && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                #{displayData.shirtNumber}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              {displayData.fullName}
            </h1>
            
            <div className="flex items-center gap-4 mb-4 text-gray-300">
              {displayData.age && <span>{displayData.age} years old</span>}
              {displayData.height && <span>{displayData.height}cm</span>}
              {displayData.weight && <span>{displayData.weight}kg</span>}
              <span>{displayData.foot} footed</span>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-gray-400 text-sm mb-1">💰 Price</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin inline" />
                  ) : priceData?.isExtinct ? (
                    'Extinct'
                  ) : (
                    `${formatPrice(priceData?.current)} 🪙`
                  )}
                </div>
              </div>
              
              {priceRange && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">📊 Range</div>
                  <div className="font-medium">
                    {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-gray-400 text-sm mb-1">📈 Trend</div>
                <PriceTrend auctions={priceData?.auctions} />
              </div>

              <div>
                <div className="text-gray-400 text-sm mb-1">⚡ AcceleRATE</div>
                <div className="font-medium text-green-400">{displayData.accelerateType}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <img src={displayData.clubImage} alt={displayData.club} className="w-8 h-8 object-contain" />
                </div>
                <div className="text-sm text-gray-400 mb-1">Club</div>
                <div className="font-medium text-sm">{displayData.club}</div>
              </div>
              
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <img src={displayData.nationImage} alt={displayData.nation} className="w-8 h-6 object-contain" />
                </div>
                <div className="text-sm text-gray-400 mb-1">Nation</div>
                <div className="font-medium text-sm">{displayData.nation}</div>
              </div>
              
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <img src={displayData.leagueImage} alt={displayData.league} className="w-8 h-8 object-contain" />
                </div>
                <div className="text-sm text-gray-400 mb-1">League</div>
                <div className="font-medium text-sm">{displayData.league}</div>
              </div>
              
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <Target className="w-6 h-6 mx-auto mb-2 text-red-400" />
                <div className="text-sm text-gray-400 mb-1">Position</div>
                <div className="font-medium">{displayData.position}</div>
              </div>
            </div>

            {/* Face Stats (Main 6 stats) */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-3 text-lg">Player Stats</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Object.entries(displayData.stats).map(([stat, value]) => (
                  <div key={stat} className="text-center">
                    <div className="text-2xl font-bold text-green-400">{value}</div>
                    <div className="text-xs text-gray-400 capitalize">{stat}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Work Rates */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <div className="text-lg font-semibold text-yellow-400">{'⭐'.repeat(displayData.skillMoves)}</div>
                <div className="text-xs text-gray-400">Skill Moves</div>
              </div>
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <div className="text-lg font-semibold text-yellow-400">{'⚽'.repeat(displayData.weakFoot)}</div>
                <div className="text-xs text-gray-400">Weak Foot</div>
              </div>
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <div className="text-sm font-semibold text-red-400">{displayData.attackingWorkRate}</div>
                <div className="text-xs text-gray-400">Attacking</div>
              </div>
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <div className="text-sm font-semibold text-blue-400">{displayData.defensiveWorkRate}</div>
                <div className="text-xs text-gray-400">Defensive</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailed Attributes */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3 text-lg">Detailed Attributes</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
            {Object.entries(displayData.attributes).map(([attr, value]) => (
              value > 0 && (
                <div key={attr} className="flex justify-between items-center bg-gray-700 rounded px-2 py-1">
                  <span className="text-gray-300 capitalize text-xs">
                    {attr.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-semibold text-green-400">{value}</span>
                </div>
              )
            ))}
          </div>
        </div>
        
        {/* Recent Sales */}
        {priceData?.auctions && priceData.auctions.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-lg">Recent Sales</h3>
            <div className="space-y-2">
              {priceData.auctions.slice(0, 5).map((auction, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">
                    {new Date(auction.soldDate).toLocaleString()}
                  </span>
                  <span className="font-medium text-yellow-400">
                    {formatPrice(auction.soldPrice)} 🪙
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

// Main app component
const FutPlayerSearch = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {!selectedPlayer ? (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">
              FUT Player Search
            </h1>
            <PlayerSearch onPlayerSelect={setSelectedPlayer} />
            <p className="text-gray-600 mt-4">
              Search by player surname to see all ratings and live prices
            </p>
          </div>
        ) : (
          <PlayerDetail 
            player={selectedPlayer} 
            onBack={() => setSelectedPlayer(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default FutPlayerSearch;
