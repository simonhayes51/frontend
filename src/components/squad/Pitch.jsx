import React from "react";

// A simple pitch with adjustable orientation (horizontal or vertical).
// We don't rotate the DOM; we change the aspect ratio and let the parent
// compute slot left/top with an orientation mapping.

export default function Pitch({ children, orientation = "horizontal" }) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={[
        "relative w-full rounded-[28px] border border-[#2a5846] bg-[#0e3b2c]",
        isVertical ? "aspect-[9/16]" : "aspect-[16/9]",
        "shadow-[inset_0_0_0_2px_rgba(255,255,255,0.06)]",
      ].join(" ")}
    >
      {/* touchlines */}
      <div className="absolute inset-[16px] rounded-[22px] border border-[#3f7a63]/70" />
      {/* halfway line */}
      <div className="absolute inset-x-[16px] top-1/2 -translate-y-1/2 h-px bg-[#3f7a63]/70" />
      {/* center circle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#3f7a63]/70 w-32 h-32" />
      {/* penalty boxes (rough, symmetric) */}
      {!isVertical ? (
        <>
          {/* left box */}
          <div className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[18%] h-[40%] border border-[#3f7a63]/70 rounded-[14px]" />
          {/* right box */}
          <div className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[18%] h-[40%] border border-[#3f7a63]/70 rounded-[14px]" />
        </>
      ) : (
        <>
          {/* top box */}
          <div className="absolute top-[16px] left-1/2 -translate-x-1/2 h-[18%] w-[40%] border border-[#3f7a63]/70 rounded-[14px]" />
          {/* bottom box */}
          <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 h-[18%] w-[40%] border border-[#3f7a63]/70 rounded-[14px]" />
        </>
      )}

      {/* players go here */}
      {children}
    </div>
  );
}
