// src/components/squad/formations_vertical.js
// All coordinates are percentages inside the pitch (0..100).
// Vertical orientation: GK at y≈94–96; attack at y≈10–25.
// x runs left→right, y runs top (opponent goal) → bottom (your goal).

// Helper to create a line of positions across the pitch evenly.
function line(keys, y, xStart = 12, xEnd = 88) {
  const c = keys.length;
  if (c === 1) return [{ key: keys[0], x: 50, y }];
  return keys.map((k, i) => ({
    key: k,
    x: Math.round(xStart + (i * (xEnd - xStart)) / (c - 1)),
    y,
  }));
}

// Generic lines
const GK_LINE   = (y = 95) => line(["GK"], y);
const BACK_FOUR = (y = 80) => line(["LB", "LCB", "RCB", "RB"], y, 18, 82);
const BACK_THREE = (y = 80) => line(["LCB", "CB", "RCB"], y, 30, 70);
const BACK_FIVE  = (y = 81) => line(["LWB","LCB","CB","RCB","RWB"], y, 14, 86);

const MF_TWO  = (y = 63) => line(["LCM","RCM"], y, 38, 62);
const MF_THREE = (y = 61) => line(["LCM","CM","RCM"], y, 34, 66);
const MF_FOUR  = (y = 61) => line(["LM","LCM","RCM","RM"], y, 18, 82);
const MF_FIVE  = (y = 58) => line(["LM","LCM","CM","RCM","RM"], y, 12, 88);

const CAM_LINE = (y = 47) => line(["LCAM","CAM","RCAM"], y, 38, 62);
const WIDE_AM  = (y = 44) => line(["LW","ST","RW"], y, 22, 78);
const FRONT_ONE = (y = 28) => line(["ST"], y);
const FRONT_TWO = (y = 30) => line(["LST","RST"], y, 42, 58);
const FRONT_THREE = (y = 33) => line(["LW","ST","RW"], y, 22, 78);

export const VERTICAL_COORDS = {
  // --- 4-3-3 family --------------------------------------------------------
  "4-3-3": [
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...MF_THREE(62),
    ...FRONT_THREE(34),
  ],
  "4-3-3 (2)": [ // holding
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...MF_TWO(67),
    ...line(["CDM"], 73, 50, 50),
    ...FRONT_THREE(34),
  ],
  "4-3-3 (3)": [ // false 9 (use CF)
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...MF_THREE(62),
    ...line(["LW","CF","RW"], 36, 22, 78),
  ],
  "4-3-3 (4)": [ // attack (CAM)
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...line(["LCM","RCM"], 66, 38, 62),
    ...line(["CAM"], 57, 50, 50),
    ...FRONT_THREE(34),
  ],
  "4-3-3 (5)": [ // defend (two CDM)
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...line(["LCDM","RCDM"], 69, 40, 60),
    ...line(["CM"], 61, 50, 50),
    ...FRONT_THREE(34),
  ],

  // --- 4-2-3-1 -------------------------------------------------------------
  "4-2-3-1": [
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...line(["LCDM","RCDM"], 69, 40, 60),
    ...line(["LAM","CAM","RAM"], 50, 32, 68),
    ...FRONT_ONE(32),
  ],
  "4-2-3-1 (2)": [ // wide mids
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...line(["LCDM","RCDM"], 69, 40, 60),
    ...line(["LM","CAM","RM"], 51, 24, 76),
    ...FRONT_ONE(32),
  ],

  // --- 4-4-2 ---------------------------------------------------------------
  "4-4-2": [
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...line(["LM","LCM","RCM","RM"], 63, 18, 82),
    ...FRONT_TWO(34),
  ],
  "4-4-2 (2)": [ // holding 2 CDM
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...line(["LCDM","RCDM"], 68, 40, 60),
    ...line(["LM","RM"], 58, 26, 74),
    ...FRONT_TWO(34),
  ],

  // --- 4-1-2-1-2 (narrow) --------------------------------------------------
  "4-1-2-1-2": [
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...line(["CDM"], 70, 50, 50),
    ...line(["LCM","RCM"], 62, 40, 60),
    ...line(["CAM"], 50, 50, 50),
    ...FRONT_TWO(33),
  ],
  // --- 4-1-2-1-2 (2) wide ---------------------------------------------------
  "4-1-2-1-2 (2)": [
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...line(["CDM"], 70, 50, 50),
    ...line(["LM","RM"], 62, 26, 74),
    ...line(["CAM"], 50, 50, 50),
    ...FRONT_TWO(33),
  ],

  // --- 4-3-1-2 / 4-3-2-1 ---------------------------------------------------
  "4-3-1-2": [
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...MF_THREE(63),
    ...line(["CAM"], 51, 50, 50),
    ...FRONT_TWO(33),
  ],
  "4-3-2-1": [
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...MF_THREE(63),
    ...line(["LF","RF"], 42, 42, 58),
    ...FRONT_ONE(31),
  ],

  // --- 4-5-1 ---------------------------------------------------------------
  "4-5-1": [
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...MF_FIVE(60),
    ...FRONT_ONE(33),
  ],
  "4-5-1 (2)": [ // 2 CDM, CAM
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...line(["LCDM","RCDM"], 68, 40, 60),
    ...line(["LM","CAM","RM"], 53, 24, 76),
    ...FRONT_ONE(33),
  ],

  // --- 4-1-4-1 --------------------------------------------------------------
  "4-1-4-1": [
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...line(["CDM"], 69, 50, 50),
    ...line(["LM","LCM","RCM","RM"], 57, 18, 82),
    ...FRONT_ONE(33),
  ],

  // --- 4-2-2-2 --------------------------------------------------------------
  "4-2-2-2": [
    ...GK_LINE(95),
    ...BACK_FOUR(82),
    ...line(["LCDM","RCDM"], 68, 40, 60),
    ...line(["LAM","RAM"], 53, 38, 62),
    ...FRONT_TWO(33),
  ],

  // --- Back three / five families -----------------------------------------
  "3-5-2": [
    ...GK_LINE(95),
    ...BACK_THREE(82),
    ...MF_FIVE(60),
    ...FRONT_TWO(33),
  ],
  "3-4-3": [
    ...GK_LINE(95),
    ...BACK_THREE(82),
    ...MF_FOUR(62),
    ...FRONT_THREE(35),
  ],
  "3-4-2-1": [
    ...GK_LINE(95),
    ...BACK_THREE(82),
    ...MF_FOUR(62),
    ...line(["LF","RF"], 43, 42, 58),
    ...FRONT_ONE(31),
  ],
  "3-4-1-2": [
    ...GK_LINE(95),
    ...BACK_THREE(82),
    ...MF_FOUR(62),
    ...line(["CAM"], 49, 50, 50),
    ...FRONT_TWO(33),
  ],

  "5-2-1-2": [
    ...GK_LINE(95),
    ...BACK_FIVE(82),
    ...MF_TWO(66),
    ...line(["CAM"], 52, 50, 50),
    ...FRONT_TWO(34),
  ],
  "5-2-2-1": [
    ...GK_LINE(95),
    ...BACK_FIVE(82),
    ...MF_TWO(66),
    ...line(["LW","RW"], 50, 32, 68),
    ...FRONT_ONE(33),
  ],
  "5-3-2": [
    ...GK_LINE(95),
    ...BACK_FIVE(82),
    ...MF_THREE(63),
    ...FRONT_TWO(34),
  ],
  "5-4-1": [
    ...GK_LINE(95),
    ...BACK_FIVE(82),
    ...line(["LM","LCM","RCM","RM"], 62, 18, 82),
    ...FRONT_ONE(34),
  ],
};
