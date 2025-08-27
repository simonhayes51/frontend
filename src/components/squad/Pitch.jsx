// src/components/squad/Pitch.jsx
import React from "react";

export default function Pitch({ children, height = "72vh" }) {
  const container = {
    position: "relative",
    width: "100%",
    height,
    minHeight: 520,
    borderRadius: 28,
    overflow: "hidden",
    background:
      "radial-gradient(ellipse at center, rgba(6,95,70,0.35), rgba(2,44,34,0.45))",
    border: "1px solid rgba(6,95,70,0.7)",
    boxShadow: "inset 0 0 0 2px rgba(5,46,39,0.5)",
  };

  const inner = {
    position: "absolute",
    top: 16,
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 22,
    border: "1px solid rgba(56,178,172,0.55)",
    overflow: "hidden",
  };

  const stripeWrap = {
    position: "absolute",
    inset: 0,
    borderRadius: 22,
    pointerEvents: "none",
  };

  const lineColor = "rgba(56,178,172,0.6)";

  return (
    <div style={container}>
      <div style={inner}>
        {/* grass stripes */}
        <div style={stripeWrap}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${(i * 100) / 14}%`,
                height: `${100 / 14}%`,
                background:
                  i % 2 === 0
                    ? "rgba(2,96,71,0.22)"
                    : "rgba(2,96,71,0.10)",
              }}
            />
          ))}
        </div>

        {/* halfway line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            borderTop: `2px solid ${lineColor}`,
          }}
        />

        {/* center circle */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "18%",
            height: "18%",
            borderRadius: "50%",
            border: `2px solid ${lineColor}`,
            boxSizing: "border-box",
          }}
        />
        {/* center spot */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "rgba(56,178,172,0.85)",
          }}
        />

        {/* top penalty area + arc */}
        <PenaltyBox position="top" lineColor={lineColor} />

        {/* bottom penalty area + arc */}
        <PenaltyBox position="bottom" lineColor={lineColor} />

        {/* children live inside the inner playable area */}
        <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      </div>
    </div>
  );
}

function PenaltyBox({ position, lineColor }) {
  const isTop = position === "top";
  const areaHeight = "22%"; // 18-yard box height relative to inner pitch
  const sixHeight = "8%";   // 6-yard box height
  const arcDiameter = "18%";

  // 18-yard box
  const areaStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "60%",
    height: areaHeight,
    borderRadius: 14,
    border: `2px solid ${lineColor}`,
    boxSizing: "border-box",
    top: isTop ? 0 : undefined,
    bottom: !isTop ? 0 : undefined,
  };

  // 6-yard box
  const sixStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "30%",
    height: sixHeight,
    borderRadius: 10,
    border: `2px solid ${lineColor}`,
    boxSizing: "border-box",
    top: isTop ? 0 : undefined,
    bottom: !isTop ? 0 : undefined,
  };

  // penalty spot
  const spotStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "rgba(56,178,172,0.85)",
    top: isTop ? "13.8%" : undefined,
    bottom: !isTop ? "13.8%" : undefined,
  };

  // penalty arc (half circle outside the area)
  const arcStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: arcDiameter,
    height: arcDiameter,
    borderRadius: "50%",
    border: `2px solid ${lineColor}`,
    boxSizing: "border-box",
    clipPath: isTop ? "inset(50% 0 0 0)" : "inset(0 0 50% 0)", // show half
    top: isTop ? `calc(${areaHeight} - 9%)` : undefined,
    bottom: !isTop ? `calc(${areaHeight} - 9%)` : undefined,
    background: "transparent",
  };

  return (
    <>
      <div style={areaStyle} />
      <div style={sixStyle} />
      <div style={spotStyle} />
      <div style={arcStyle} />
    </>
  );
}
