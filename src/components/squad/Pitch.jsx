// src/components/squad/Pitch.jsx
import React from "react";

export default function Pitch({ children, height = "800px" }) {
  const container = {
    position: "relative",
    width: "100%",
    height,
    minHeight: 700, // Increased from 520
    borderRadius: 28,
    overflow: "hidden",
    background: `
      radial-gradient(ellipse at center, rgba(6,95,70,0.3), rgba(2,44,34,0.2) 70%),
      linear-gradient(180deg, 
        rgba(6,95,70,0.15) 0%, 
        rgba(4,120,87,0.08) 25%,
        rgba(6,95,70,0.05) 50%, 
        rgba(4,120,87,0.08) 75%,
        rgba(6,95,70,0.15) 100%)
    `,
    border: "2px solid rgba(6,95,70,0.6)",
    boxShadow: `
      0 12px 40px rgba(0,0,0,0.5),
      inset 0 0 0 2px rgba(34,197,94,0.15),
      inset 0 2px 0 rgba(255,255,255,0.05)
    `,
  };

  const inner = {
    position: "absolute",
    top: 16,
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 22,
    border: "2px solid rgba(34,197,94,0.4)",
    overflow: "hidden",
  };

  const stripeWrap = {
    position: "absolute",
    inset: 0,
    borderRadius: 22,
    pointerEvents: "none",
  };

  const lineColor = "rgba(34,197,94,0.5)";
  const markingColor = "rgba(255,255,255,0.3)";

  return (
    <div style={container}>
      <div style={inner}>
        {/* Enhanced grass stripes */}
        <div style={stripeWrap}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${(i * 100) / 18}%`,
                height: `${100 / 18}%`,
                background:
                  i % 2 === 0
                    ? "rgba(6,95,70,0.12)"
                    : "rgba(4,120,87,0.06)",
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        {/* Center line */}
        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            top: "50%",
            transform: "translateY(-50%)",
            borderTop: `3px solid ${markingColor}`,
            filter: "drop-shadow(0 0 6px rgba(255,255,255,0.2))",
          }}
        />

        {/* Center circle */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "22%",
            height: "22%",
            borderRadius: "50%",
            border: `3px solid ${markingColor}`,
            boxSizing: "border-box",
            filter: "drop-shadow(0 0 6px rgba(255,255,255,0.2))",
          }}
        />
        
        {/* Center spot */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: markingColor,
            boxShadow: "0 0 8px rgba(255,255,255,0.4)",
          }}
        />

        {/* Enhanced penalty areas */}
        <EnhancedPenaltyBox position="top" lineColor={markingColor} />
        <EnhancedPenaltyBox position="bottom" lineColor={markingColor} />

        {/* Corner arcs */}
        <CornerArc corner="top-left" color={markingColor} />
        <CornerArc corner="top-right" color={markingColor} />
        <CornerArc corner="bottom-left" color={markingColor} />
        <CornerArc corner="bottom-right" color={markingColor} />

        {/* Children container */}
        <div style={{ position: "absolute", inset: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function EnhancedPenaltyBox({ position, lineColor }) {
  const isTop = position === "top";
  const areaHeight = "28%"; // Increased for better proportions
  const sixHeight = "12%";

  // 18-yard box
  const areaStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "68%",
    height: areaHeight,
    border: `3px solid ${lineColor}`,
    boxSizing: "border-box",
    top: isTop ? 0 : undefined,
    bottom: !isTop ? 0 : undefined,
    borderTopLeftRadius: isTop ? 0 : 16,
    borderTopRightRadius: isTop ? 0 : 16,
    borderBottomLeftRadius: !isTop ? 0 : 16,
    borderBottomRightRadius: !isTop ? 0 : 16,
    filter: "drop-shadow(0 0 6px rgba(255,255,255,0.15))",
  };

  // 6-yard box
  const sixStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "35%",
    height: sixHeight,
    border: `3px solid ${lineColor}`,
    boxSizing: "border-box",
    top: isTop ? 0 : undefined,
    bottom: !isTop ? 0 : undefined,
    borderTopLeftRadius: isTop ? 0 : 12,
    borderTopRightRadius: isTop ? 0 : 12,
    borderBottomLeftRadius: !isTop ? 0 : 12,
    borderBottomRightRadius: !isTop ? 0 : 12,
    filter: "drop-shadow(0 0 6px rgba(255,255,255,0.15))",
  };

  // Penalty spot
  const spotStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: lineColor,
    top: isTop ? "17%" : undefined,
    bottom: !isTop ? "17%" : undefined,
    boxShadow: "0 0 8px rgba(255,255,255,0.4)",
  };

  // Penalty arc
  const arcStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "25%",
    height: "25%",
    borderRadius: "50%",
    border: `3px solid ${lineColor}`,
    boxSizing: "border-box",
    clipPath: isTop ? "inset(50% 0 0 0)" : "inset(0 0 50% 0)",
    top: isTop ? `calc(${areaHeight} - 12.5%)` : undefined,
    bottom: !isTop ? `calc(${areaHeight} - 12.5%)` : undefined,
    background: "transparent",
    filter: "drop-shadow(0 0 6px rgba(255,255,255,0.15))",
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

function CornerArc({ corner, color }) {
  const size = "15%";
  const thickness = "3px";
  
  const getPosition = () => {
    switch (corner) {
      case "top-left":
        return { top: 0, left: 0, clipPath: "inset(0 50% 50% 0)" };
      case "top-right":
        return { top: 0, right: 0, clipPath: "inset(0 0 50% 50%)" };
      case "bottom-left":
        return { bottom: 0, left: 0, clipPath: "inset(50% 50% 0 0)" };
      case "bottom-right":
        return { bottom: 0, right: 0, clipPath: "inset(50% 0 0 50%)" };
      default:
        return {};
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${thickness} solid ${color}`,
        background: "transparent",
        filter: "drop-shadow(0 0 4px rgba(255,255,255,0.15))",
        ...getPosition(),
      }}
    />
  );
}
