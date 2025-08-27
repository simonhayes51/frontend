import React from 'react';

export default function PlayerTile({ player, chem = 0, badge = null, draggable = false, onDragStart }) {
  return (
    <div className="flex items-center gap-2">
      <div
        draggable={draggable}
        onDragStart={e => draggable && onDragStart?.(e)}
        className="shrink-0 w-10 h-12 rounded-lg bg-neutral-800 grid place-items-center text-xs font-bold"
        title={draggable ? "Drag to move" : undefined}
      >
        {player.rating}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold leading-tight truncate">{player.name} {player.isIcon?"• ICON":player.isHero?"• HERO":""}</div>
        <div className="text-[10px] opacity-80 truncate">{player.club} • {player.league}</div>
      </div>
      {badge}
      {typeof player.price === 'number' && (
        <div className="ml-auto text-xs opacity-90">{player.price.toLocaleString()}c</div>
      )}
    </div>
  );
}
