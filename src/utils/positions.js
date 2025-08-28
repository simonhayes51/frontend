// src/utils/positions.js

// Canonical set
const POSITION_SET = new Set([
  "GK",
  "RB","RWB","CB","LB","LWB",
  "CDM","CM","CAM",
  "RM","LM",
  "RW","LW",
  "RF","LF","CF","ST",
]);

// Common aliases → canonical
const ALIASES = new Map([
  ["GOALKEEPER","GK"], ["KEEPER","GK"], ["G K","GK"],

  ["RIGHT BACK","RB"], ["RIGHTBACK","RB"],
  ["LEFT BACK","LB"], ["LEFTBACK","LB"],
  ["RIGHT WING BACK","RWB"], ["RIGHTWINGBACK","RWB"],
  ["LEFT WING BACK","LWB"], ["LEFTWINGBACK","LWB"],
  ["CENTER BACK","CB"], ["CENTRE BACK","CB"], ["CENTERBACK","CB"], ["CENTREBACK","CB"],

  ["DEFENSIVE MID","CDM"], ["DEFENSIVE MIDFIELDER","CDM"],
  ["CENTER MID","CM"], ["CENTRE MID","CM"], ["CENTERMID","CM"], ["CENTREMID","CM"],
  ["ATTACKING MID","CAM"], ["ATTACKING MIDFIELDER","CAM"],

  ["RIGHT MID","RM"], ["RIGHTMID","RM"],
  ["LEFT MID","LM"],  ["LEFTMID","LM"],

  ["RIGHT WING","RW"], ["RIGHTWING","RW"],
  ["LEFT WING","LW"],  ["LEFTWING","LW"],

  ["RIGHT FORWARD","RF"], ["RIGHTFORWARD","RF"],
  ["LEFT FORWARD","LF"],  ["LEFTFORWARD","LF"],
  ["CENTRE FORWARD","CF"], ["CENTER FORWARD","CF"], ["CENTREFORWARD","CF"], ["CENTERFORWARD","CF"],

  ["STRIKER","ST"], ["FORWARD","ST"],
]);

// Compatibility: a card with base position P can be used at slots in this list
const COMPATIBILITY = {
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
  ST: ["ST","CF","RF","LF","RW","LW"],
};

function normalizePosition(p) {
  if (p == null) return null;
  const s = String(p).trim().toUpperCase().replace(/\s+/g, " ");
  if (POSITION_SET.has(s)) return s;

  if (ALIASES.has(s)) return ALIASES.get(s);

  const tight = s.replace(/\s+/g, "");
  if (ALIASES.has(tight)) return ALIASES.get(tight);

  const letters = s.replace(/[^A-Z]/g, "");
  if (POSITION_SET.has(letters)) return letters;
  if (ALIASES.has(letters)) return ALIASES.get(letters);

  return null;
}

export function normalizePositions(list) {
  const arr = Array.isArray(list) ? list : [list];
  const out = [];
  const seen = new Set();
  for (const raw of arr) {
    const n = normalizePosition(raw);
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

export const POSITIONS = Array.from(POSITION_SET);

/**
 * slotPosition: a single code ("ST")
 * playerPositions: array of codes ["ST","CF"] (will be normalized)
 */
export function isValidForSlot(slotPosition, playerPositions) {
  const slot = normalizePosition(slotPosition);
  if (!slot) return false;
  const list = normalizePositions(playerPositions);

  for (const p of list) {
    if (p === slot) return true; // exact
    const compat = COMPATIBILITY[p] || [];
    if (compat.includes(slot)) return true;
  }
  return false;
}