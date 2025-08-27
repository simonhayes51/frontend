// src/components/squad/formations_vertical.js
// Vertical-pitch coordinates (0..100) – top = opponent goal
// Keys must be unique per formation; `pos` is the expected in-position role for validation.

export const VERTICAL_COORDS = {
  // ----------------- 4 ATB -----------------
  "4-3-3": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LCM", pos: "CM",  x: 33, y: 58 },
    { key: "CM",  pos: "CM",  x: 50, y: 54 },
    { key: "RCM", pos: "CM",  x: 67, y: 58 },

    { key: "LW",  pos: "LW",  x: 22, y: 31 },
    { key: "ST",  pos: "ST",  x: 50, y: 26 },
    { key: "RW",  pos: "RW",  x: 78, y: 31 },
  ],

  "4-3-3 (2)": [ // Holding (CDM)
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LCM", pos: "CM",  x: 33, y: 58 },
    { key: "CDM", pos: "CDM", x: 50, y: 64 },
    { key: "RCM", pos: "CM",  x: 67, y: 58 },

    { key: "LW",  pos: "LW",  x: 22, y: 31 },
    { key: "ST",  pos: "ST",  x: 50, y: 26 },
    { key: "RW",  pos: "RW",  x: 78, y: 31 },
  ],

  "4-3-3 (3)": [ // False 9 (CF)
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LCM", pos: "CM",  x: 33, y: 58 },
    { key: "CM",  pos: "CM",  x: 50, y: 55 },
    { key: "RCM", pos: "CM",  x: 67, y: 58 },

    { key: "LW",  pos: "LW",  x: 24, y: 33 },
    { key: "CF",  pos: "CF",  x: 50, y: 31 },
    { key: "RW",  pos: "RW",  x: 76, y: 33 },
  ],

  "4-3-3 (4)": [ // Attack (CAM)
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LCM", pos: "CM",  x: 33, y: 61 },
    { key: "CAM", pos: "CAM", x: 50, y: 46 },
    { key: "RCM", pos: "CM",  x: 67, y: 61 },

    { key: "LW",  pos: "LW",  x: 22, y: 31 },
    { key: "ST",  pos: "ST",  x: 50, y: 26 },
    { key: "RW",  pos: "RW",  x: 78, y: 31 },
  ],

  "4-3-3 (5)": [ // Defend (double pivot)
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LDM", pos: "CDM", x: 41, y: 64 },
    { key: "RDM", pos: "CDM", x: 59, y: 64 },
    { key: "CM",  pos: "CM",  x: 50, y: 55 },

    { key: "LW",  pos: "LW",  x: 24, y: 35 },
    { key: "ST",  pos: "ST",  x: 50, y: 28 },
    { key: "RW",  pos: "RW",  x: 76, y: 35 },
  ],

  "4-2-3-1": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LDM", pos: "CDM", x: 41, y: 65 },
    { key: "RDM", pos: "CDM", x: 59, y: 65 },

    { key: "LAM", pos: "LAM", x: 32, y: 46 },
    { key: "CAM", pos: "CAM", x: 50, y: 43 },
    { key: "RAM", pos: "RAM", x: 68, y: 46 },

    { key: "ST",  pos: "ST",  x: 50, y: 27 },
  ],

  "4-2-3-1 (2)": [ // wide wingers
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LDM", pos: "CDM", x: 41, y: 65 },
    { key: "RDM", pos: "CDM", x: 59, y: 65 },

    { key: "LW",  pos: "LW",  x: 25, y: 40 },
    { key: "CAM", pos: "CAM", x: 50, y: 43 },
    { key: "RW",  pos: "RW",  x: 75, y: 40 },

    { key: "ST",  pos: "ST",  x: 50, y: 27 },
  ],

  "4-1-2-1-2": [ // Narrow
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "CDM", pos: "CDM", x: 50, y: 66 },

    { key: "LCM", pos: "CM",  x: 35, y: 55 },
    { key: "RCM", pos: "CM",  x: 65, y: 55 },

    { key: "CAM", pos: "CAM", x: 50, y: 42 },

    { key: "LST", pos: "ST",  x: 42, y: 27 },
    { key: "RST", pos: "ST",  x: 58, y: 27 },
  ],

  "4-1-2-1-2 (2)": [ // Wide (LM/RM + 2 ST)
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "CDM", pos: "CDM", x: 50, y: 66 },

    { key: "LM",  pos: "LM",  x: 26, y: 54 },
    { key: "RM",  pos: "RM",  x: 74, y: 54 },

    { key: "CAM", pos: "CAM", x: 50, y: 42 },

    { key: "LST", pos: "ST",  x: 42, y: 27 },
    { key: "RST", pos: "ST",  x: 58, y: 27 },
  ],

  "4-3-1-2": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LCM", pos: "CM",  x: 33, y: 60 },
    { key: "CM",  pos: "CM",  x: 50, y: 56 },
    { key: "RCM", pos: "CM",  x: 67, y: 60 },

    { key: "CAM", pos: "CAM", x: 50, y: 43 },

    { key: "LST", pos: "ST",  x: 43, y: 27 },
    { key: "RST", pos: "ST",  x: 57, y: 27 },
  ],

  "4-3-2-1": [ // LF/RF narrow front three
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LCM", pos: "CM",  x: 33, y: 59 },
    { key: "CM",  pos: "CM",  x: 50, y: 55 },
    { key: "RCM", pos: "CM",  x: 67, y: 59 },

    { key: "LF",  pos: "LF",  x: 42, y: 33 },
    { key: "RF",  pos: "RF",  x: 58, y: 33 },
    { key: "ST",  pos: "ST",  x: 50, y: 25 },
  ],

  "4-4-2": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LM",  pos: "LM",  x: 27, y: 57 },
    { key: "LCM", pos: "CM",  x: 41, y: 59 },
    { key: "RCM", pos: "CM",  x: 59, y: 59 },
    { key: "RM",  pos: "RM",  x: 73, y: 57 },

    { key: "LST", pos: "ST",  x: 44, y: 28 },
    { key: "RST", pos: "ST",  x: 56, y: 28 },
  ],

  "4-4-2 (2)": [ // 2 CDMs
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LM",  pos: "LM",  x: 27, y: 55 },
    { key: "LDM", pos: "CDM", x: 44, y: 62 },
    { key: "RDM", pos: "CDM", x: 56, y: 62 },
    { key: "RM",  pos: "RM",  x: 73, y: 55 },

    { key: "LST", pos: "ST",  x: 44, y: 28 },
    { key: "RST", pos: "ST",  x: 56, y: 28 },
  ],

  "4-4-1-1": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LM",  pos: "LM",  x: 27, y: 56 },
    { key: "LCM", pos: "CM",  x: 42, y: 58 },
    { key: "RCM", pos: "CM",  x: 58, y: 58 },
    { key: "RM",  pos: "RM",  x: 73, y: 56 },

    { key: "CF",  pos: "CF",  x: 50, y: 37 },
    { key: "ST",  pos: "ST",  x: 50, y: 26 },
  ],

  "4-4-1-1 (2)": [ // CAM instead of CF
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LM",  pos: "LM",  x: 27, y: 56 },
    { key: "LCM", pos: "CM",  x: 42, y: 58 },
    { key: "RCM", pos: "CM",  x: 58, y: 58 },
    { key: "RM",  pos: "RM",  x: 73, y: 56 },

    { key: "CAM", pos: "CAM", x: 50, y: 39 },
    { key: "ST",  pos: "ST",  x: 50, y: 26 },
  ],

  "4-1-4-1": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "CDM", pos: "CDM", x: 50, y: 66 },

    { key: "LM",  pos: "LM",  x: 27, y: 54 },
    { key: "LCM", pos: "CM",  x: 41, y: 56 },
    { key: "RCM", pos: "CM",  x: 59, y: 56 },
    { key: "RM",  pos: "RM",  x: 73, y: 54 },

    { key: "ST",  pos: "ST",  x: 50, y: 27 },
  ],

  "4-5-1": [ // flat mids
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LM",  pos: "LM",  x: 26, y: 58 },
    { key: "LCM", pos: "CM",  x: 39, y: 59 },
    { key: "CM",  pos: "CM",  x: 50, y: 56 },
    { key: "RCM", pos: "CM",  x: 61, y: 59 },
    { key: "RM",  pos: "RM",  x: 74, y: 58 },

    { key: "ST",  pos: "ST",  x: 50, y: 27 },
  ],

  "4-5-1 (2)": [ // attack (CAM + 2 CMs)
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LM",  pos: "LM",  x: 26, y: 59 },
    { key: "LCM", pos: "CM",  x: 42, y: 62 },
    { key: "RCM", pos: "CM",  x: 58, y: 62 },
    { key: "RM",  pos: "RM",  x: 74, y: 59 },

    { key: "CAM", pos: "CAM", x: 50, y: 43 },
    { key: "ST",  pos: "ST",  x: 50, y: 27 },
  ],

  "4-2-2-2": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 19, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 81, y: 76 },

    { key: "LDM", pos: "CDM", x: 42, y: 64 },
    { key: "RDM", pos: "CDM", x: 58, y: 64 },

    { key: "LAM", pos: "LAM", x: 38, y: 46 },
    { key: "RAM", pos: "RAM", x: 62, y: 46 },

    { key: "LST", pos: "ST",  x: 44, y: 27 },
    { key: "RST", pos: "ST",  x: 56, y: 27 },
  ],

  "4-2-4": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LB",  pos: "LB",  x: 20, y: 76 },
    { key: "LCB", pos: "CB",  x: 36, y: 79 },
    { key: "RCB", pos: "CB",  x: 64, y: 79 },
    { key: "RB",  pos: "RB",  x: 80, y: 76 },

    { key: "LCM", pos: "CM",  x: 42, y: 62 },
    { key: "RCM", pos: "CM",  x: 58, y: 62 },

    { key: "LW",  pos: "LW",  x: 23, y: 33 },
    { key: "LST", pos: "ST",  x: 42, y: 26 },
    { key: "RST", pos: "ST",  x: 58, y: 26 },
    { key: "RW",  pos: "RW",  x: 77, y: 33 },
  ],

  // ----------------- 3 ATB -----------------
  "3-4-3": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LCB", pos: "CB",  x: 33, y: 81 },
    { key: "CB",  pos: "CB",  x: 50, y: 84 },
    { key: "RCB", pos: "CB",  x: 67, y: 81 },

    { key: "LM",  pos: "LM",  x: 22, y: 62 },
    { key: "LCM", pos: "CM",  x: 40, y: 60 },
    { key: "RCM", pos: "CM",  x: 60, y: 60 },
    { key: "RM",  pos: "RM",  x: 78, y: 62 },

    { key: "LW",  pos: "LW",  x: 26, y: 35 },
    { key: "ST",  pos: "ST",  x: 50, y: 26 },
    { key: "RW",  pos: "RW",  x: 74, y: 35 },
  ],

  "3-4-2-1": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LCB", pos: "CB",  x: 33, y: 81 },
    { key: "CB",  pos: "CB",  x: 50, y: 84 },
    { key: "RCB", pos: "CB",  x: 67, y: 81 },

    { key: "LM",  pos: "LM",  x: 22, y: 62 },
    { key: "LCM", pos: "CM",  x: 40, y: 60 },
    { key: "RCM", pos: "CM",  x: 60, y: 60 },
    { key: "RM",  pos: "RM",  x: 78, y: 62 },

    { key: "LAM", pos: "LAM", x: 42, y: 42 },
    { key: "RAM", pos: "RAM", x: 58, y: 42 },
    { key: "ST",  pos: "ST",  x: 50, y: 27 },
  ],

  "3-5-2": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LCB", pos: "CB",  x: 33, y: 80 },
    { key: "CB",  pos: "CB",  x: 50, y: 83 },
    { key: "RCB", pos: "CB",  x: 67, y: 80 },

    { key: "LM",  pos: "LM",  x: 20, y: 62 },
    { key: "LDM", pos: "CDM", x: 40, y: 62 },
    { key: "RDM", pos: "CDM", x: 60, y: 62 },
    { key: "RM",  pos: "RM",  x: 80, y: 62 },

    { key: "LAM", pos: "CAM", x: 43, y: 45 },
    { key: "RAM", pos: "CAM", x: 57, y: 45 },

    { key: "LST", pos: "ST",  x: 44, y: 27 },
    { key: "RST", pos: "ST",  x: 56, y: 27 },
  ],

  "3-1-4-2": [
    { key: "GK",  pos: "GK",  x: 50, y: 91 },
    { key: "LCB", pos: "CB",  x: 33, y: 81 },
    { key: "CB",  pos: "CB",  x: 50, y: 84 },
    { key: "RCB", pos: "CB",  x: 67, y: 81 },

    { key: "CDM", pos: "CDM", x: 50, y: 68 },

    { key: "LM",  pos: "LM",  x: 24, y: 58 },
    { key: "LCM", pos: "CM",  x: 41, y: 58 },
    { key: "RCM", pos: "CM",  x: 59, y: 58 },
    { key: "RM",  pos: "RM",  x: 76, y: 58 },

    { key: "LST", pos: "ST",  x: 44, y: 27 },
    { key: "RST", pos: "ST",  x: 56, y: 27 },
  ],

  // ----------------- 5 ATB -----------------
  "5-2-1-2": [
    { key: "GK",  pos: "GK",  x: 50, y: 92 },
    { key: "LWB", pos: "LWB", x: 20, y: 75 },
    { key: "LCB", pos: "CB",  x: 35, y: 81 },
    { key: "CB",  pos: "CB",  x: 50, y: 84 },
    { key: "RCB", pos: "CB",  x: 65, y: 81 },
    { key: "RWB", pos: "RWB", x: 80, y: 75 },

    { key: "LCM", pos: "CM",  x: 42, y: 60 },
    { key: "RCM", pos: "CM",  x: 58, y: 60 },

    { key: "CAM", pos: "CAM", x: 50, y: 43 },

    { key: "LST", pos: "ST",  x: 44, y: 27 },
    { key: "RST", pos: "ST",  x: 56, y: 27 },
  ],

  "5-2-2-1": [
    { key: "GK",  pos: "GK",  x: 50, y: 92 },
    { key: "LWB", pos: "LWB", x: 20, y: 75 },
    { key: "LCB", pos: "CB",  x: 35, y: 81 },
    { key: "CB",  pos: "CB",  x: 50, y: 84 },
    { key: "RCB", pos: "CB",  x: 65, y: 81 },
    { key: "RWB", pos: "RWB", x: 80, y: 75 },

    { key: "LCM", pos: "CM",  x: 42, y: 61 },
    { key: "RCM", pos: "CM",  x: 58, y: 61 },

    { key: "LW",  pos: "LW",  x: 28, y: 40 },
    { key: "ST",  pos: "ST",  x: 50, y: 27 },
    { key: "RW",  pos: "RW",  x: 72, y: 40 },
  ],

  "5-3-2": [
    { key: "GK",  pos: "GK",  x: 50, y: 92 },
    { key: "LWB", pos: "LWB", x: 20, y: 75 },
    { key: "LCB", pos: "CB",  x: 35, y: 81 },
    { key: "CB",  pos: "CB",  x: 50, y: 84 },
    { key: "RCB", pos: "CB",  x: 65, y: 81 },
    { key: "RWB", pos: "RWB", x: 80, y: 75 },

    { key: "LCM", pos: "CM",  x: 40, y: 60 },
    { key: "CM",  pos: "CM",  x: 50, y: 57 },
    { key: "RCM", pos: "CM",  x: 60, y: 60 },

    { key: "LST", pos: "ST",  x: 45, y: 27 },
    { key: "RST", pos: "ST",  x: 55, y: 27 },
  ],

  "5-4-1": [
    { key: "GK",  pos: "GK",  x: 50, y: 92 },
    { key: "LWB", pos: "LWB", x: 20, y: 75 },
    { key: "LCB", pos: "CB",  x: 35, y: 81 },
    { key: "CB",  pos: "CB",  x: 50, y: 84 },
    { key: "RCB", pos: "CB",  x: 65, y: 81 },
    { key: "RWB", pos: "RWB", x: 80, y: 75 },

    { key: "LM",  pos: "LM",  x: 28, y: 58 },
    { key: "LCM", pos: "CM",  x: 42, y: 60 },
    { key: "RCM", pos: "CM",  x: 58, y: 60 },
    { key: "RM",  pos: "RM",  x: 72, y: 58 },

    { key: "ST",  pos: "ST",  x: 50, y: 27 },
  ],

  "5-4-1 (2)": [ // DM line
    { key: "GK",  pos: "GK",  x: 50, y: 92 },
    { key: "LWB", pos: "LWB", x: 20, y: 75 },
    { key: "LCB", pos: "CB",  x: 35, y: 81 },
    { key: "CB",  pos: "CB",  x: 50, y: 84 },
    { key: "RCB", pos: "CB",  x: 65, y: 81 },
    { key: "RWB", pos: "RWB", x: 80, y: 75 },

    { key: "LDM", pos: "CDM", x: 42, y: 65 },
    { key: "RDM", pos: "CDM", x: 58, y: 65 },
    { key: "LM",  pos: "LM",  x: 28, y: 56 },
    { key: "RM",  pos: "RM",  x: 72, y: 56 },

    { key: "ST",  pos: "ST",  x: 50, y: 27 },
  ],
};
