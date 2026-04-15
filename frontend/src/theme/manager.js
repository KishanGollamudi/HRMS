// Bryzos-inspired Warm Light Theme — Manager Module
export const B = {
  bg:       "#f5f4f0",
  bg2:      "#eeecea",
  card:     "#ffffff",
  sidebar:  "#1a1a2e",
  border:   "#e8e6e1",
  accent:   "#f97316",
  accentBg: "rgba(249,115,22,0.08)",
  accentBd: "rgba(249,115,22,0.2)",
  text:     "#0f0f1a",
  sub:      "#6b7280",
  muted:    "#9ca3af",
  green:    "#10b981",
  greenBg:  "rgba(16,185,129,0.08)",
  red:      "#ef4444",
  redBg:    "rgba(239,68,68,0.08)",
  amber:    "#f59e0b",
  amberBg:  "rgba(245,158,11,0.08)",
  blue:     "#3b82f6",
  blueBg:   "rgba(59,130,246,0.08)",
  purple:   "#8b5cf6",
  purpleBg: "rgba(139,92,246,0.08)",
  shadow:   "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 24px rgba(0,0,0,0.08)",
};

// Alias so older pages importing G still work
export const G = B;

export const inp = {
  background:  "#ffffff",
  border:      "1.5px solid #e8e6e1",
  borderRadius: 10,
  color:       "#0f0f1a",
  padding:     "8px 12px",
  fontSize:    13,
  outline:     "none",
  width:       "100%",
  boxSizing:   "border-box",
  fontFamily:  "inherit",
};

export const sel = { ...inp, height: 38, cursor: "pointer" };

export const lbl = {
  color:          "#6b7280",
  fontSize:       11,
  fontWeight:     700,
  textTransform:  "uppercase",
  letterSpacing:  "0.07em",
  display:        "block",
  marginBottom:   5,
};
