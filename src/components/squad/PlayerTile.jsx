import React, { useMemo } from "react";

/** Format 1234567 -> "1,234,567c" */
function formatCoins(n) {
  if (typeof n !== "number" || isNaN(n)) return "—";
  return n.toLocaleString() + "c";
}

/** Small chem dot color scale */
function chemColor(chem) {
  if (chem >= 3) return "rgba(132, 204, 22, 1)";     // lime-400
  if (chem === 2) return "rgba(163, 230, 53, 1)";    // lime-300
  if (chem === 1) return "rgba(190, 242, 100, 1)";   // lime-200
  return "rgba(75,85,99,1)";                         // slate-500 (off)
}

/**
 * PlayerTile
 * Props:
 *  - player: { name, rating, image_url, price, positions[], club, nation }
 *  - pos:     current slot position label (e.g. 'RB') – used to flag OOP
 *  - chem:    0..3
 *  - draggable, onDragStart
 *  - size:    'sm' | 'md' | 'lg'
 */
export default function PlayerTile({
  player,
  pos,
  chem = 0,
  draggable = false,
  onDragStart,
  size = "md",
  badge, // ignored here; we render our own chem
}) {
  const s = useMemo(() => {
    // base size presets (you can tweak these if needed)
    if (size === "lg") return { w: 118, h: 152, r: 16 };
    if (size === "sm") return { w: 92, h: 120, r: 14 };
    return { w: 108, h: 140, r: 15 }; // md
  }, [size]);

  const oop =
    pos && Array.isArray(player?.positions)
      ? !player.positions.map(String).map(p => p.toUpperCase()).includes(String(pos).toUpperCase())
      : false;

  return (
    <div
      className="squad-card"
      draggable={draggable}
      onDragStart={onDragStart}
      title={`${player?.name || "—"} • ${player?.rating ?? ""}${pos ? " • " + pos : ""}`}
      style={{
        width: s.w,
        height: s.h,
        borderRadius: s.r,
        cursor: draggable ? "grab" : "default",
      }}
    >
      {/* glow frame */}
      <div
        className="squad-card__frame"
        style={{ borderRadius: s.r }}
      />

      {/* image */}
      <img
        className="squad-card__img"
        src={player?.image_url || ""}
        alt={player?.name || "player"}
        style={{ borderRadius: s.r }}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.style.opacity = 0;
        }}
      />

      {/* top row: rating + position + chem dot */}
      <div className="squad-card__top">
        <div className="pill rating">{player?.rating ?? "—"}</div>
        {pos && <div className="pill pos">{pos}</div>}
        <div className="chem-dot" style={{ backgroundColor: chemColor(chem) }}>
          {Math.max(0, Math.min(3, chem))}
        </div>
        {oop && <div className="oop-dot" title="Out of position" />}
      </div>

      {/* bottom info: name + price */}
      <div className="squad-card__bottom">
        <div className="name" title={player?.name || ""}>
          {player?.name || "—"}
        </div>
        <div className="price" title={player?.price ? formatCoins(player.price) : "—"}>
          <img
            className="coin"
            alt=""
            src="https://cdn2.futbin.com/https%3A%2F%2Fcdn.futbin.com%2Fdesign%2Fimg%2Fcoins_big.png?fm=png&ixlib=java-2.1.0&w=32&s=cad4ceb684da7f0b778fdeb1d4065fb1"
          />
          <span className="price-text">{player?.price ? formatCoins(player.price) : "—"}</span>
        </div>
      </div>
    </div>
  );
}
