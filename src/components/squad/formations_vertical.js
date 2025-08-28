// src/components/squad/formations_vertical.js
// Enhanced with more formations and better positioning
// All coordinates are percentages inside the pitch (0..100).
// Vertical orientation: GK at y≈94–96; attack at y≈10–25.

function line(keys, y, xStart = 12, xEnd = 88) {
  const c = keys.length;
  if (c === 1) return [{ key: keys[0], x: 50, y }];
  return keys.map((k, i) => ({
    key: k,
    x: Math.round(xStart + (i * (xEnd - xStart)) / (c - 1)),
    y,
  }));
}

// Enhanced positioning helpers
const GK_LINE   = (y = 94) => line(["GK"], y);
const BACK_FOUR = (y = 78) => line(["LB", "LCB", "RCB", "RB"], y, 16, 84);
const BACK_THREE = (y = 78) => line(["LCB", "CB", "RCB"], y, 28, 72);
const BACK_FIVE  = (y = 79) => line(["LWB","LCB","CB","RCB","RWB"], y, 12, 88);

const MF_TWO  = (y = 60) => line(["LCM","RCM"], y, 35, 65);
const MF_THREE = (y = 58) => line(["LCM","CM","RCM"], y, 30, 70);
const MF_FOUR  = (y = 58) => line(["LM","LCM","RCM","RM"], y, 16, 84);
const MF_FIVE  = (y = 55) => line(["LM","LCM","CM","RCM","RM"], y, 12, 88);

const CAM_LINE = (y = 42) => line(["CAM"], y);
const CAM_THREE = (y = 44) => line(["LCAM","CAM","RCAM"], y, 32, 68);
const WIDE_AM  = (y = 40) => line(["LW","CAM","RW"], y, 20, 80);
const FRONT_ONE = (y = 25) => line(["ST"], y);
const FRONT_TWO = (y = 27) => line(["LST","RST"], y, 38, 62);
const FRONT_THREE = (y = 30) => line(["LW","ST","RW"], y, 20, 80);

export const VERTICAL_COORDS = {
  // --- 4-3-3 family --------------------------------------------------------
  "4-3-3": [
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...MF_THREE(58),
    ...FRONT_THREE(30),
  ],
  "4-3-3 (2)": [ // holding
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["LCM","RCM"], 62, 32, 68),
    ...line(["CDM"], 68, 50, 50),
    ...FRONT_THREE(30),
  ],
  "4-3-3 (3)": [ // false 9
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...MF_THREE(58),
    ...line(["LW","CF","RW"], 32, 20, 80),
  ],
  "4-3-3 (4)": [ // attack
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["LCM","RCM"], 62, 32, 68),
    ...CAM_LINE(48),
    ...FRONT_THREE(30),
  ],
  "4-3-3 (5)": [ // defend
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["LCDM","RCDM"], 65, 35, 65),
    ...line(["CM"], 55, 50, 50),
    ...FRONT_THREE(30),
  ],

  // --- 4-2-3-1 -------------------------------------------------------------
  "4-2-3-1": [
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["LCDM","RCDM"], 65, 35, 65),
    ...line(["LAM","CAM","RAM"], 45, 28, 72),
    ...FRONT_ONE(27),
  ],
  "4-2-3-1 (2)": [ // wide
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["LCDM","RCDM"], 65, 35, 65),
    ...line(["LM","CAM","RM"], 46, 20, 80),
    ...FRONT_ONE(27),
  ],

  // --- 4-4-2 ---------------------------------------------------------------
  "4-4-2": [
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["LM","LCM","RCM","RM"], 58, 16, 84),
    ...FRONT_TWO(30),
  ],
  "4-4-2 (2)": [ // holding
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["LCDM","RCDM"], 63, 35, 65),
    ...line(["LM","RM"], 53, 20, 80),
    ...FRONT_TWO(30),
  ],

  // --- 4-1-2-1-2 -----------------------------------------------------------
  "4-1-2-1-2": [
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["CDM"], 65, 50, 50),
    ...line(["LCM","RCM"], 55, 32, 68),
    ...CAM_LINE(42),
    ...FRONT_TWO(28),
  ],
  "4-1-2-1-2 (2)": [ // wide
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["CDM"], 65, 50, 50),
    ...line(["LM","RM"], 55, 22, 78),
    ...CAM_LINE(42),
    ...FRONT_TWO(28),
  ],

  // --- 4-3-1-2 / 4-3-2-1 ---------------------------------------------------
  "4-3-1-2": [
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...MF_THREE(58),
    ...CAM_LINE(43),
    ...FRONT_TWO(28),
  ],
  "4-3-2-1": [
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...MF_THREE(58),
    ...line(["LF","RF"], 38, 35, 65),
    ...FRONT_ONE(26),
  ],

  // --- 4-5-1 ---------------------------------------------------------------
  "4-5-1": [
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...MF_FIVE(55),
    ...FRONT_ONE(28),
  ],
  "4-5-1 (2)": [ // 2 CDM + CAM
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["LCDM","RCDM"], 63, 35, 65),
    ...line(["LM","CAM","RM"], 48, 20, 80),
    ...FRONT_ONE(28),
  ],

  // --- 4-1-4-1 --------------------------------------------------------------
  "4-1-4-1": [
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["CDM"], 63, 50, 50),
    ...line(["LM","LCM","RCM","RM"], 52, 16, 84),
    ...FRONT_ONE(28),
  ],

  // --- 4-2-2-2 --------------------------------------------------------------
  "4-2-2-2": [
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["LCDM","RCDM"], 63, 35, 65),
    ...line(["LAM","RAM"], 48, 32, 68),
    ...FRONT_TWO(28),
  ],

  // --- 3 at the back formations --------------------------------------------
  "3-5-2": [
    ...GK_LINE(94),
    ...BACK_THREE(78),
    ...MF_FIVE(55),
    ...FRONT_TWO(28),
  ],
  "3-4-3": [
    ...GK_LINE(94),
    ...BACK_THREE(78),
    ...MF_FOUR(58),
    ...FRONT_THREE(30),
  ],
  "3-4-2-1": [
    ...GK_LINE(94),
    ...BACK_THREE(78),
    ...MF_FOUR(58),
    ...line(["LF","RF"], 38, 35, 65),
    ...FRONT_ONE(26),
  ],
  "3-4-1-2": [
    ...GK_LINE(94),
    ...BACK_THREE(78),
    ...MF_FOUR(58),
    ...CAM_LINE(43),
    ...FRONT_TWO(28),
  ],

  // --- 5 at the back formations --------------------------------------------
  "5-2-1-2": [
    ...GK_LINE(94),
    ...BACK_FIVE(79),
    ...MF_TWO(62),
    ...CAM_LINE(45),
    ...FRONT_TWO(29),
  ],
  "5-2-2-1": [
    ...GK_LINE(94),
    ...BACK_FIVE(79),
    ...MF_TWO(62),
    ...line(["LW","RW"], 45, 25, 75),
    ...FRONT_ONE(28),
  ],
  "5-3-2": [
    ...GK_LINE(94),
    ...BACK_FIVE(79),
    ...MF_THREE(58),
    ...FRONT_TWO(29),
  ],
  "5-4-1": [
    ...GK_LINE(94),
    ...BACK_FIVE(79),
    ...line(["LM","LCM","RCM","RM"], 58, 16, 84),
    ...FRONT_ONE(29),
  ],

  // --- More attacking formations -------------------------------------------
  "4-2-4": [
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["LCDM","RCDM"], 63, 35, 65),
    ...line(["LW","LF","RF","RW"], 35, 18, 82),
  ],

  "3-5-1-1": [
    ...GK_LINE(94),
    ...BACK_THREE(78),
    ...MF_FIVE(55),
    ...CAM_LINE(38),
    ...FRONT_ONE(26),
  ],

  "4-1-3-2": [
    ...GK_LINE(94),
    ...BACK_FOUR(78),
    ...line(["CDM"], 63, 50, 50),
    ...line(["LW","CAM","RW"], 45, 25, 75),
    ...FRONT_TWO(28),
  ],
};
