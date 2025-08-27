import React from "react";

/** Vertical pitch with darker lines & subtle texture */
export default function Pitch({ children, orientation = "vertical" }) {
  // We only use vertical now, but keep the prop harmlessly.
  const isVertical = true;

  return (
    <div
      className={[
        "relative w-full rounded-[28px] border border-[#1d2b26] bg-[#0c1412]",
        "aspect-[9/16] overflow-hidden",
      ].join(" ")}
    >
      {/* grass tint */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,40,32,.35),transparent_60%)] pointer-events-none" />

      {/* touchlines */}
      <div className="absolute inset-[18px] rounded-[22px] border border-[#2c463d]/80" />
      {/* halfway line */}
      <div className="absolute inset-x-[18px] top-1/2 -translate-y-1/2 h-px bg-[#2c463d]/80" />
      {/* center circle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2c463d]/80 w-36 h-36" />

      {/* penalty boxes */}
      <div className="absolute top-[18px] left-1/2 -translate-x-1/2 h-[18%] w-[46%] border border-[#2c463d]/80 rounded-[14px]" />
      <div className="absolute bottom-[18px] left-1/2 -translate-x-1/2 h-[18%] w-[46%] border border-[#2c463d]/80 rounded-[14px]" />

      {children}
    </div>
  );
}
