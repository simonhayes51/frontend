import React from "react";

const cls = (...xs) => xs.filter(Boolean).join(" ");

function ChemDiamonds({ chem = 0 }) {
  const n = Math.max(0, Math.min(3, Number(chem) || 0));
  return (
    <div className="flex gap-[2px] mt-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cls(
            "w-3 h-3 rotate-45",
            i < n ? "bg-lime-400" : "bg-neutral-700"
          )}
          style={{ clipPath: "polygon(50% 0,100% 50%,50% 100%,0 50%)" }}
        />
      ))}
    </div>
  );
}

export default function PlayerTile({
  player,
  chem = 0,
  size = "lg",
  draggable,
  onDragStart,
  rightSlot,
}) {
  const s = size === "lg" ? { w: 96, h: 128, img: 88 } : { w: 80, h: 110, img: 72 };

  return (
    <div
      className="relative text-white select-none"
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {/* card body */}
      <div
        className="rounded-2xl bg-[#11151a] border border-neutral-700 shadow-xl overflow-hidden"
        style={{ width: s.w, height: s.h }}
      >
        {/* image */}
        <div className="relative" style={{ height: s.img }}>
          {player?.image_url ? (
            <img
              src={player.image_url}
              alt={player?.name || "card"}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-xs text-neutral-400">
              No image
            </div>
          )}
          {/* rating pill */}
          <div className="absolute top-1 left-1 rounded-lg px-1.5 py-[2px] text-[11px] font-black bg-black/70">
            {player?.rating ?? "–"}
          </div>
        </div>

        {/* meta row */}
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-1">
            <div className="text-[11px] font-bold truncate max-w-[70%]">
              {player?.name || "—"}
            </div>
            {rightSlot}
          </div>

          {/* position + price */}
          <div className="mt-1 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wide text-neutral-300">
              {(player?.positions?.[0] || player?.position || "—")}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-yellow-300">
              <img
                src="https://cdn2.futbin.com/https%3A%2F%2Fcdn.futbin.com%2Fdesign%2Fimg%2Fcoins_big.png?fm=png&w=16"
                className="w-3.5 h-3.5"
              />
              {(player?.price ?? 0).toLocaleString()}c
            </div>
          </div>

          {/* chem diamonds */}
          <ChemDiamonds chem={chem} />
        </div>
      </div>
    </div>
  );
}
