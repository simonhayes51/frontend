// src/components/squad/Pitch.jsx
import React from "react";
import "../../styles/squad.css";

/**
 * Vertical pitch container with proper markings.
 * Places children absolutely using % coordinates (x,y in 0..100).
 */
export default function Pitch({ children, height = "600px" }) {
  return (
    <div
      className="pitch-vert relative rounded-3xl overflow-hidden border border-gray-800 bg-emerald-900/60"
      style={{ height }}
    >
      {/* Grass gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900" />
      {/* Subtle stripes */}
      <div className="absolute inset-0 pitch-stripes pointer-events-none" />
      {/* Markings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* outer border */}
        <rect x="1" y="1" width="98" height="98" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
        {/* halfway line */}
        <line x1="1" y1="50" x2="99" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="0.3" />
        {/* center circle */}
        <circle cx="50" cy="50" r="7" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="0.8" fill="rgba(255,255,255,0.7)" />

        {/* Penalty areas */}
        {/* Bottom goal */}
        <rect x="25" y="88" width="50" height="11" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.3" />
        <rect x="35" y="92" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.3" />
        <circle cx="50" cy="94.5" r="0.8" fill="rgba(255,255,255,0.7)" />
        {/* Top goal */}
        <rect x="25" y="1" width="50" height="11" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.3" />
        <rect x="35" y="1" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.3" />
        <circle cx="50" cy="5.5" r="0.8" fill="rgba(255,255,255,0.7)" />
      </svg>

      {/* content */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}