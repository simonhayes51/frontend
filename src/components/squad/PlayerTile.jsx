// src/components/squad/PlayerTile.jsx
import React from "react";

export default function PlayerTile({
  player,
  badge,
  draggable = false,
  onDragStart,
  outOfPosition = false,
  chem = 0,
  size = "md",
  onClick,
  showActions = false,
  onSwap,
  onClear,
}) {
  const coin = "https://cdn2.futbin.com/https%3A%2F%2Fcdn.futbin.com%2Fdesign%2Fimg%2Fcoins_big.png?fm=png&ixlib=java-2.1.0&w=40&s=cad4ceb684da7f0b778fdeb1d4065fb1";

  // Size variants
  const sizeClasses = {
    sm: "w-16 h-20",
    md: "w-20 h-28", 
    lg: "w-24 h-32"
  };

  const textSizes = {
    sm: { rating: "text-xs", pos: "text-xs", name: "text-xs", price: "text-xs" },
    md: { rating: "text-xs", pos: "text-xs", name: "text-xs", price: "text-xs" },
    lg: { rating: "text-sm", pos: "text-sm", name: "text-sm", price: "text-sm" }
  };

  // Card styling based on player type and state
  const getCardClasses = () => {
    let base = `${sizeClasses[size]} squad-card rounded-xl relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`;
    
    if (player.isIcon) {
      base += " icon-card";
    } else if (player.isHero) {
      base += " hero-card"; 
    } else {
      base += " bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900";
    }

    if (outOfPosition) {
      base += " ring-2 ring-red-500/50";
    }

    if (onClick) {
      base += " cursor-pointer";
    }

    return base;
  };

  // Chemistry dot styling
  const getChemDotClass = () => {
    if (outOfPosition) return "bg-red-500 animate-pulse";
    if (chem >= 3) return "bg-lime-400";
    if (chem === 2) return "bg-yellow-400";
    if (chem === 1) return "bg-orange-400";
    return "bg-gray-500";
  };

  return (
    <div className="relative group">
      <div
        className={getCardClasses()}
        draggable={draggable}
        onDragStart={onDragStart}
        onClick={onClick}
      >
        {/* Card frame overlay */}
        <div className="squad-card__frame" />

        {/* Player image */}
        {player.image_url && (
          <img 
            className="squad-card__img" 
            src={player.image_url} 
            alt={player.name} 
            referrerPolicy="no-referrer" 
          />
        )}

        {/* Top badges row */}
        <div className="squad-card__top">
          <span className={`pill rating ${textSizes[size].rating}`}>
            {player.rating || "-"}
          </span>
          <span className={`pill pos ${textSizes[size].pos}`}>
            {(player.positions?.[0] || "").toUpperCase()}
          </span>
          
          {/* Custom badge (if provided) */}
          {badge}

          {/* Special card type indicators */}
          {player.isIcon && size !== "sm" && (
            <span className="text-xs bg-orange-500/90 text-white px-1.5 py-0.5 rounded font-bold shadow-sm">
              ICON
            </span>
          )}
          {player.isHero && size !== "sm" && (
            <span className="text-xs bg-purple-500/90 text-white px-1.5 py-0.5 rounded font-bold shadow-sm">
              HERO
            </span>
          )}

          {/* Chemistry indicator */}
          <div 
            className={`ml-auto w-3 h-3 rounded-full border border-black/30 shadow-sm ${getChemDotClass()}`}
            title={`Chemistry: ${chem}/3${outOfPosition ? ' • Out of position' : ''}`}
          />
        </div>

        {/* Bottom content */}
        <div className="squad-card__bottom">
          {/* Player name */}
          <div className={`name ${textSizes[size].name}`}>
            {player.name}
          </div>

          {/* Price */}
          {typeof player.price === "number" && (
            <div className={`price ${textSizes[size].price}`}>
              <img className="coin" src={coin} alt="coins" />
              <span className="price-text">{player.price.toLocaleString()}c</span>
            </div>
          )}
        </div>

        {/* Out of position overlay */}
        {outOfPosition && (
          <div className="absolute inset-0 bg-red-500/10 border-2 border-red-500/30 rounded-xl pointer-events-none" />
        )}
      </div>

      {/* Out of position label */}
      {outOfPosition && size !== "sm" && (
        <div className="absolute -bottom-6 left-0 right-0 text-center">
          <span className="text-xs text-red-400 bg-red-900/80 px-2 py-0.5 rounded-full border border-red-500/50 shadow-sm">
            Out of Position
          </span>
        </div>
      )}

      {/* Action buttons (shown on hover when enabled) */}
      {showActions && (onSwap || onClear) && (
        <div className="absolute -bottom-8 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
          <div className="flex justify-center gap-2">
            {onSwap && (
              <button
                className="bg-gray-800/95 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 transition-colors shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSwap();
                }}
              >
                Swap
              </button>
            )}
            {onClear && (
              <button
                className="bg-red-800/95 hover:bg-red-700 text-white text-xs px-2 py-1 rounded border border-red-600 transition-colors shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}// src/components/squad/PlayerTile.jsx
import React from "react";

export default function PlayerTile({
  player,
  badge,
  draggable = false,
  onDragStart,
  outOfPosition = false,
  chem = 0,
  size = "md",
  onClick,
  showActions = false,
  onSwap,
  onClear,
}) {
  const coin = "https://cdn2.futbin.com/https%3A%2F%2Fcdn.futbin.com%2Fdesign%2Fimg%2Fcoins_big.png?fm=png&ixlib=java-2.1.0&w=40&s=cad4ceb684da7f0b778fdeb1d4065fb1";

  // Size variants
  const sizeClasses = {
    sm: "w-16 h-20",
    md: "w-20 h-28", 
    lg: "w-24 h-32"
  };

  const textSizes = {
    sm: { rating: "text-xs", pos: "text-xs", name: "text-xs", price: "text-xs" },
    md: { rating: "text-xs", pos: "text-xs", name: "text-xs", price: "text-xs" },
    lg: { rating: "text-sm", pos: "text-sm", name: "text-sm", price: "text-sm" }
  };

  // Card styling based on player type and state
  const getCardClasses = () => {
    let base = `${sizeClasses[size]} squad-card rounded-xl relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`;
    
    if (player.isIcon) {
      base += " icon-card";
    } else if (player.isHero) {
      base += " hero-card"; 
    } else {
      base += " bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900";
    }

    if (outOfPosition) {
      base += " ring-2 ring-red-500/50";
    }

    if (onClick) {
      base += " cursor-pointer";
    }

    return base;
  };

  // Chemistry dot styling
  const getChemDotClass = () => {
    if (outOfPosition) return "bg-red-500 animate-pulse";
    if (chem >= 3) return "bg-lime-400";
    if (chem === 2) return "bg-yellow-400";
    if (chem === 1) return "bg-orange-400";
    return "bg-gray-500";
  };

  return (
    <div className="relative group">
      <div
        className={getCardClasses()}
        draggable={draggable}
        onDragStart={onDragStart}
        onClick={onClick}
      >
        {/* Card frame overlay */}
        <div className="squad-card__frame" />

        {/* Player image */}
        {player.image_url && (
          <img 
            className="squad-card__img" 
            src={player.image_url} 
            alt={player.name} 
            referrerPolicy="no-referrer" 
          />
        )}

        {/* Top badges row */}
        <div className="squad-card__top">
          <span className={`pill rating ${textSizes[size].rating}`}>
            {player.rating || "-"}
          </span>
          <span className={`pill pos ${textSizes[size].pos}`}>
            {(player.positions?.[0] || "").toUpperCase()}
          </span>
          
          {/* Custom badge (if provided) */}
          {badge}

          {/* Special card type indicators */}
          {player.isIcon && size !== "sm" && (
            <span className="text-xs bg-orange-500/90 text-white px-1.5 py-0.5 rounded font-bold shadow-sm">
              ICON
            </span>
          )}
          {player.isHero && size !== "sm" && (
            <span className="text-xs bg-purple-500/90 text-white px-1.5 py-0.5 rounded font-bold shadow-sm">
              HERO
            </span>
          )}

          {/* Chemistry indicator */}
          <div 
            className={`ml-auto w-3 h-3 rounded-full border border-black/30 shadow-sm ${getChemDotClass()}`}
            title={`Chemistry: ${chem}/3${outOfPosition ? ' • Out of position' : ''}`}
          />
        </div>

        {/* Bottom content */}
        <div className="squad-card__bottom">
          {/* Player name */}
          <div className={`name ${textSizes[size].name}`}>
            {player.name}
          </div>

          {/* Price */}
          {typeof player.price === "number" && (
            <div className={`price ${textSizes[size].price}`}>
              <img className="coin" src={coin} alt="coins" />
              <span className="price-text">{player.price.toLocaleString()}c</span>
            </div>
          )}
        </div>

        {/* Out of position overlay */}
        {outOfPosition && (
          <div className="absolute inset-0 bg-red-500/10 border-2 border-red-500/30 rounded-xl pointer-events-none" />
        )}
      </div>

      {/* Out of position label */}
      {outOfPosition && size !== "sm" && (
        <div className="absolute -bottom-6 left-0 right-0 text-center">
          <span className="text-xs text-red-400 bg-red-900/80 px-2 py-0.5 rounded-full border border-red-500/50 shadow-sm">
            Out of Position
          </span>
        </div>
      )}

      {/* Action buttons (shown on hover when enabled) */}
      {showActions && (onSwap || onClear) && (
        <div className="absolute -bottom-8 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
          <div className="flex justify-center gap-2">
            {onSwap && (
              <button
                className="bg-gray-800/95 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 transition-colors shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSwap();
                }}
              >
                Swap
              </button>
            )}
            {onClear && (
              <button
                className="bg-red-800/95 hover:bg-red-700 text-white text-xs px-2 py-1 rounded border border-red-600 transition-colors shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
