// src/components/squad/Pitch.jsx
import React from "react";

export default function Pitch({ children }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0c1412] rounded-[28px] border border-[#162521]">
      <div
        className="absolute inset-0 origin-center"
        style={{
          transform: "rotate(90deg)",   // rotate the whole pitch
          transformOrigin: "center center",
        }}
      >
        {/* keep your existing pitch drawing code here (lines, boxes, children, etc.) */}
        {children}
      </div>
    </div>
  );
}
