// src/components/squad/Pitch.jsx
import React from "react";

export default function Pitch({ children, height = "600px", orientation = "vertical" }) {
  const container = {
    position: "relative",
    width: "100%",
    height,
    minHeight: 520,
    borderRadius: 24,
    overflow: "hidden",
    background: `
      radial-gradient(ellipse at center, rgba(6,95,70,0.25), rgba(2,44,34,0.15) 70%),
      linear-gradient(180deg, 
        rgba(6,95,70,0.18) 0%, 
        rgba(4,120,87,0.12) 25%,
        rgba(6,95,70,0.08) 50%, 
        rgba(4,120,87,0.12) 75%,
        rgba(6,95,70,0.18) 100%)
    `,
    border: "2px solid rgba(6,95,70,0.4)",
    boxShadow: `
      0 8px 32px rgba(0,0,0,0.4),
      inset 0 0 0 1px rgba(34,197,94,0.1),
      inset 0 1px 0 rgba(255,255,255,0.05)
    `,
  };

  const inner = {
    position: "absolute",
    top: 12,
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 18,
    border: "2px solid rgba(34,197,94,0.3)",
    overflow: "hidden",
    background: "transparent",
  };

  const stripeWrap = {
    position: "absolute",
    inset: 0,
    borderRadius: 18,
    pointerEvents: "none",
  };

  const lineColor = "rgba(34,197,94,0.4)";
  const markingColor = "rgba(255,255,255,0.25)";

  return (
    <div style={container}>
      <div style={inner}>
        {/* Enhanced grass stripes with subtle animation */}
        <div style={stripeWrap}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="grass-stripe"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${(i * 100) / 16}%`,
                height: `${100 / 16}%`,
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
            left: "5%",
            right: "5%",
            top: "50%",
            transform: "translateY(-50%)",
            borderTop: `2px solid ${markingColor}`,
            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.1))",
          }}
        />

        {/* Center circle */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "20%",
            height: "20%",
            borderRadius: "50%",
            border: `2px solid ${markingColor}`,
            boxSizing: "border-box",
            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.1))",
          }}
        />
        
        {/* Center spot */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: markingColor,
            boxShadow: "0 0 6px rgba(255,255,255,0.3)",
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
  const areaHeight = "24%";
  const sixHeight = "9%";
  const arcRadius = "10%";

  // 18-yard box
  const areaStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "65%",
    height: areaHeight,
    border: `2px solid ${lineColor}`,
    boxSizing: "border-box",
    top: isTop ? 0 : undefined,
    bottom: !isTop ? 0 : undefined,
    borderTopLeftRadius: isTop ? 0 : 12,
    borderTopRightRadius: isTop ? 0 : 12,
    borderBottomLeftRadius: !isTop ? 0 : 12,
    borderBottomRightRadius: !isTop ? 0 : 12,
    filter: "drop-shadow(0 0 4px rgba(255,255,255,0.1))",
  };

  // 6-yard box (goal area)
  const sixStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "32%",
    height: sixHeight,
    border: `2px solid ${lineColor}`,
    boxSizing: "border-box",
    top: isTop ? 0 : undefined,
    bottom: !isTop ? 0 : undefined,
    borderTopLeftRadius: isTop ? 0 : 8,
    borderTopRightRadius: isTop ? 0 : 8,
    borderBottomLeftRadius: !isTop ? 0 : 8,
    borderBottomRightRadius: !isTop ? 0 : 8,
    filter: "drop-shadow(0 0 4px rgba(255,255,255,0.1))",
  };

  // Penalty spot
  const spotStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: lineColor,
    top: isTop ? "15%" : undefined,
    bottom: !isTop ? "15%" : undefined,
    boxShadow: "0 0 6px rgba(255,255,255,0.3)",
  };

  // Penalty arc
  const arcStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "22%",
    height: "22%",
    borderRadius: "50%",
    border: `2px solid ${lineColor}`,
    boxSizing: "border-box",
    clipPath: isTop ? "inset(50% 0 0 0)" : "inset(0 0 50% 0)",
    top: isTop ? `calc(${areaHeight} - 11%)` : undefined,
    bottom: !isTop ? `calc(${areaHeight} - 11%)` : undefined,
    background: "transparent",
    filter: "drop-shadow(0 0 4px rgba(255,255,255,0.1))",
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
  const size = "12%";
  const thickness = "2px";
  
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
        filter: "drop-shadow(0 0 3px rgba(255,255,255,0.1))",
        ...getPosition(),
      }}
    />
  );
}
