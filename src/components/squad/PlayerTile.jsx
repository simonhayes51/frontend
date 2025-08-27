// src/components/squad/PlayerTile.jsx
import React from "react";

export default function PlayerTile({
  player,
  badge,
  draggable = false,
  onDragStart,
  outOfPosition = false, // <- pass from parent using isValidForSlot
}) {
  const coin = "https://cdn2.futbin.com/https%3A%2F%2Fcdn.futbin.com%2Fdesign%2Fimg%2Fcoins_big.png?fm=png&ixlib=java-2.1.0&w=40&s=cad4ceb684da7f0b778fdeb1d4065fb1";

  return (
    <div
      className="squad-card rounded-2xl"
      style={{ width: 96, height: 136 }}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div className="squad-card__frame" />
      {player.image_url && (
        <img className="squad-card__img" src={player.image_url} alt={player.name} referrerPolicy="no-referrer" />
      )}

      <div className="squad-card__top">
        <span className="pill rating">{player.rating || "-"}</span>
        <span className="pill pos">{(player.positions?.[0] || "").toUpperCase()}</span>
        {badge}
        {/* small OOP dot */}
        {outOfPosition && <span className="oop-dot" title="Out of position" />}
      </div>

      <div className="squad-card__bottom">
        <div className="name">{player.name}</div>
        {typeof player.price === "number" && (
          <div className="price">
            <img className="coin" src={coin} alt="coins" />
            <span className="price-text">{player.price.toLocaleString()}c</span>
          </div>
        )}
      </div>
    </div>
  );
}
