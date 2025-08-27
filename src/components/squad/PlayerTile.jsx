// src/components/squad/PlayerTile.jsx
import React from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const buildProxy = (url) => `${API_BASE}/img?url=${encodeURIComponent(url)}`;

export default function PlayerTile({ player, badge, draggable, onDragStart }) {
  if (!player) return null;

  const src = player.image_url;

  return (
    <div
      className="flex items-center gap-2"
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {/* Card image */}
      <div className="relative w-12 h-16 rounded-md overflow-hidden bg-neutral-800 shrink-0">
        {src ? (
          <img
            src={src}
            alt={player.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const el = e.currentTarget;
              // fallback to backend proxy once
              if (!el.dataset.proxied && src) {
                el.dataset.proxied = "1";
                el.src = buildProxy(src);
              } else {
                el.style.display = "none";
              }
            }}
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-[10px] opacity-60">
            No Img
          </div>
        )}
        {/* Rating overlay */}
        <div className="absolute top-0 left-0 text-xs font-bold bg-black/70 px-1 rounded-br">
          {player.rating || "?"}
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate">{player.name}</div>
        <div className="text-[11px] text-neutral-400 truncate">
          {player.club || "—"} · {player.league || "—"} · {player.nation || "—"}
        </div>
        {player.positions?.length > 0 && (
          <div className="text-[11px] text-neutral-300">
            {player.positions.join(" / ")}
          </div>
        )}
      </div>

      {/* Right side (chem badge + price) */}
      <div className="ml-auto flex items-center gap-2">
        {badge}
        {player.price && (
          <div className="text-xs text-yellow-300">
            {player.price.toLocaleString()}c
          </div>
        )}
      </div>
    </div>
  );
}
