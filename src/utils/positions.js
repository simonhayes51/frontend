// src/utils/positions.js

// Canonical list
export const POSITIONS = [
  "GK",
  "RB","RWB","CB","LB","LWB",
  "CDM","CM","CAM",
  "RM","LM",
  "RW","LW",
  "RF","LF","CF","ST"
];

// Buckets (useful for filters/UI)
export const POSITION_GROUPS = {
  GK: ["GK"],
  DEF: ["RB","RWB","CB","LB","LWB"],
  MID: ["CDM","CM","CAM","RM","LM"],
  ATT: ["RW","LW","RF","LF","CF","ST"]
};

export const positionToGroup = (pos) => {
  const p = String(pos || "").toUpperCase();
  if (p === "GK") return "GK";
  if (POSITION_GROUPS.DEF.includes(p)) return "DEF";
  if (POSITION_GROUPS.MID.includes(p)) return "MID";
  if (POSITION_GROUPS.ATT.includes(p)) return "ATT";
  return "OTHER";
};

export const isPosition = (pos) =>
  POSITIONS.includes(String(pos || "").toUpperCase());

// Simple OOP/compat map (tweak if you have stricter rules)
export const COMPATIBILITY = {
  GK: ["GK"],

  RB: ["RB","RWB","CB"],
  RWB:["RWB","RB","RM"],
  CB: ["CB","RB","LB"],
  LB: ["LB","LWB","CB"],
  LWB:["LWB","LB","LM"],

  CDM:["CDM","CM","CB"],
  CM: ["CM","CDM","CAM"],
  CAM:["CAM","CM","CF"],

  RM: ["RM","RW","RWB","CM"],
  LM: ["LM","LW","LWB","CM"],

  RW: ["RW","RM","RF","ST"],
  LW: ["LW","LM","LF","ST"],
  RF: ["RF","CF","RW","ST"],
  LF: ["LF","CF","LW","ST"],
  CF: ["CF","CAM","ST","RF","LF"],
  ST: ["ST","CF","RF","LF","RW","LW"]
};

export const isCompatible = (cardPos, slotPos) => {
  const a = String(cardPos || "").toUpperCase();
  const b = String(slotPos || "").toUpperCase();
  const list = COMPATIBILITY[a] || [a];
  return list.includes(b);
};

// Normalise various free-text inputs to your codes
const ALIASES = new Map([
  ["GOALKEEPER","GK"], ["KEEPER","GK"],
  ["RIGHTBACK","RB"], ["LEFTBACK","LB"],
  ["RIGHTWINGBACK","RWB"], ["LEFTWINGBACK","LWB"],
  ["CENTERBACK","CB"], ["CENTREBACK","CB"],
  ["DEFENSIVEMID","CDM"], ["DEFENSIVEMIDFIELDER","CDM"],
  ["MID","CM"], ["MIDFIELDER","CM"],
  ["ATTACKINGMID","CAM"], ["ATTACKINGMIDFIELDER","CAM"],
  ["RIGHTMID","RM"], ["LEFTMID","LM"],
  ["RIGHTWING","RW"], ["LEFTWING","LW"],
  ["RIGHTFORWARD","RF"], ["LEFTFORWARD","LF"],
  ["CENTREFORWARD","CF"], ["CENTERFORWARD","CF"],
  ["STRIKER","ST"], ["FORWARD","ST"]
]);

export const normalizePosition = (p) => {
  const raw = String(p || "").toUpperCase().replace(/\s+/g, "");
  if (POSITIONS.includes(raw)) return raw;
  return ALIASES.get(raw) || raw;
};
