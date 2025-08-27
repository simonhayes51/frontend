// src/components/squad/Pitch.jsx
import React from "react";

/**
 * Accurate vertical football pitch.
 * Dimensions are proportional to 105m x 68m.
 * We render inside an "inner" area (the white lines inset).
 */
export default function Pitch({ children }) {
  // proportions as percentages of the INNER area
  const PEN_BOX_W = 59.3;   // 40.32m / 68m
  const PEN_BOX_H = 15.7;   // 16.5m / 105m
  const GOAL_BOX_W = 26.9;  // 18.32m / 68m
  const GOAL_BOX_H = 5.24;  // 5.5m / 105m
  const SPOT_Y = 10.48;     // 11m / 105m from goal line
  const ARC_D = 26.9;       // diameter from 2*9.15m / 68m (≈26.9% of width)
  const CC_D = 26.9;        // center circle diameter uses same 9.15m radius

  const line = "border border-[#2c463d]/80";
  const faint = "bg-[#2c463d]/80";

  return (
    <div className="relative w-full aspect-[9/16] rounded-[28px] overflow-hidden border border-[#162521] bg-[#0c1412]">
      {/* gentle grass tint */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(18,58,46,.22),transparent_60%)] pointer-events-none" />

      {/* INNER play area (all % below are relative to this box) */}
      <div className={`absolute inset-[16px] rounded-[22px] ${line}`}>
        {/* halfway line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-[#2c463d]/70" />

        {/* center circle */}
        <div
          className={`absolute rounded-full ${line}`}
          style={{
            width: `${CC_D}%`,
            height: `${CC_D}%`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* center spot */}
        <div
          className={`absolute rounded-full ${faint}`}
          style={{
            width: 6, height: 6,
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: 9999,
          }}
        />

        {/* --- TOP penalty area --- */}
        <RectCentered widthPct={PEN_BOX_W} heightPct={PEN_BOX_H} topPct={0} className={line} />
        {/* top goal area */}
        <RectCentered widthPct={GOAL_BOX_W} heightPct={GOAL_BOX_H} topPct={0} className={line} />
        {/* top penalty spot */}
        <DotAt yPct={SPOT_Y} className={faint} />
        {/* top penalty arc (visible below the box line) */}
        <ArcAt
          yPct={SPOT_Y}
          diameterPct={ARC_D}
          clip="bottom"
          className={line}
        />

        {/* --- BOTTOM penalty area --- */}
        <RectCentered widthPct={PEN_BOX_W} heightPct={PEN_BOX_H} bottomPct={0} className={line} />
        {/* bottom goal area */}
        <RectCentered widthPct={GOAL_BOX_W} heightPct={GOAL_BOX_H} bottomPct={0} className={line} />
        {/* bottom penalty spot */}
        <DotAt yPct={100 - SPOT_Y} className={faint} />
        {/* bottom penalty arc (visible above the box line) */}
        <ArcAt
          yPct={100 - SPOT_Y}
          diameterPct={ARC_D}
          clip="top"
          className={line}
        />

        {/* children (players) */}
        {children}
      </div>
    </div>
  );
}

/* -------- helpers (all % are relative to INNER box) -------- */

function RectCentered({ widthPct, heightPct, topPct, bottomPct, className = "" }) {
  const style = {
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    left: "50%",
    transform: "translateX(-50%)",
    ...(topPct !== undefined ? { top: `${topPct}%` } : {}),
    ...(bottomPct !== undefined ? { bottom: `${bottomPct}%` } : {}),
  };
  return <div className={`absolute rounded-[14px] ${className}`} style={style} />;
}

function DotAt({ yPct, className = "" }) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        width: 6,
        height: 6,
        left: "50%",
        top: `${yPct}%`,
        transform: "translate(-50%, -50%)",
        borderRadius: 9999,
      }}
    />
  );
}

/**
 * Penalty arc at given Y (penalty spot). `clip` trims which half is visible.
 * clip = "bottom" shows the lower semicircle (top penalty), "top" shows upper semicircle (bottom penalty).
 */
function ArcAt({ yPct, diameterPct, clip = "bottom", className = "" }) {
  const style = {
    width: `${diameterPct}%`,
    height: `${diameterPct}%`,
    left: "50%",
    top: `${yPct}%`,
    transform: "translate(-50%, -50%)",
    clipPath: clip === "bottom" ? "inset(50% 0 0 0)" : "inset(0 0 50% 0)",
  };
  return <div className={`absolute rounded-full ${className}`} style={style} />;
}
