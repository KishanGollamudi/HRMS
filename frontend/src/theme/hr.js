// HR Module Theme — Rose & Warm Stone palette (#D45769, #D4CFC9)
export const H = {
  bg:        "#fdf8f8",
  bg2:       "#f5eeee",
  card:      "#ffffff",
  border:    "#ead8d8",
  accent:    "#D45769",
  accentBg:  "rgba(212,87,105,0.07)",
  accentBd:  "rgba(212,87,105,0.2)",
  accentGlow:"0 4px 16px rgba(212,87,105,0.25)",
  stone:     "#D4CFC9",
  gradient:  "linear-gradient(135deg,#D45769 0%,#D4CFC9 100%)",
  gradientR:  "linear-gradient(135deg,#D4CFC9 0%,#D45769 100%)",
  text:      "#1f1214",
  sub:       "#6b5b5e",
  muted:     "#a8969a",
  green:     "#10b981",
  greenBg:   "rgba(16,185,129,0.08)",
  greenBd:   "rgba(16,185,129,0.2)",
  amber:     "#f59e0b",
  amberBg:   "rgba(245,158,11,0.08)",
  amberBd:   "rgba(245,158,11,0.2)",
  red:       "#ef4444",
  redBg:     "rgba(239,68,68,0.08)",
  redBd:     "rgba(239,68,68,0.2)",
  purple:    "#8b5cf6",
  purpleBg:  "rgba(139,92,246,0.08)",
  shadow:    "0 1px 2px rgba(212,87,105,0.04), 0 4px 12px rgba(212,87,105,0.06)",
  shadowMd:  "0 4px 20px rgba(212,87,105,0.10)",
};

export const hInp = {
  background:   "#ffffff",
  border:       "1.5px solid #ead8d8",
  borderRadius: 10,
  color:        "#1f1214",
  padding:      "9px 13px",
  fontSize:     13,
  outline:      "none",
  width:        "100%",
  boxSizing:    "border-box",
  fontFamily:   "inherit",
  transition:   "border-color 0.15s",
};

export const hSel = { ...hInp, height: 40, cursor: "pointer" };

export const hLbl = {
  color:         "#a8969a",
  fontSize:      11,
  fontWeight:    700,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  display:       "block",
  marginBottom:  6,
};
