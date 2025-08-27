import React from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const buildProxy = (url) => `${API_BASE}/img?url=${encodeURIComponent(url)}`;

function chemDot(chem = 0) {
  const c = Math.max(0, Math.min(3, Number(chem) || 0));
  const color =
    c >= 3 ? "bg-emerald-400" :
    c === 2 ? "bg-emerald-300" :
    c === 1 ? "bg-amber-300" :
              "bg-neutral-600";
  return (
    <div
      title={`Chem ${c}/3`}
      className={`ml-auto w-2.5 h-2.5 rounded-full ${color} ring-2 ring-neutral-900 shrink-0`}
    />
  );
}

export default function PlayerTile({
  player,
  chem = 0,
  draggable,
  onDragStart,
  size = "lg", // "sm" | "lg"
  rightSlot,   // extra action area (eg. Add button)
}) {
  if (!player) return null;

  const src = player.image_url;
  const big = size === "lg";

  return (
    <div
      className={`flex items-center gap-3 ${big ? "p-2" : ""}`}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {/* Card image (larger) */}
      <div className={`relative ${big ? "w-14 h-18" : "w-12 h-16"} rounded-lg overflow-hidden bg-neutral-800 shrink-0`}>
        {src ? (
          <img
            src={src}
            alt={player.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const el = e.currentTarget;
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
        {/* Rating pill */}
        <div className="absolute top-0 left-0 text-xs font-black bg-black/70 px-1.5 py-0.5 rounded-br">
          {player.rating ?? "?"}
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className={`truncate ${big ? "text-sm" : "text-xs"} font-semibold`}>
            {player.name}
          </div>
          {chemDot(chem)}
        </div>

        {/* positions */}
        {player.positions?.length > 0 && (
          <div className="mt-0.5 text-[11px] text-neutral-300">
            {player.positions.join(" / ")}
          </div>
        )}

        {/* meta row */}
        <div className="text-[11px] text-neutral-400 truncate">
          {(player.club || "—")} · {(player.league || "—")} · {(player.nation || "—")}
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {player.price ? (
          <div className="text-xs font-semibold text-yellow-300">
            {player.price.toLocaleString()}c
          </div>
        ) : null}
        {rightSlot}
      </div>
    </div>
  );
}
