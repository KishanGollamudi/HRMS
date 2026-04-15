export function shortCohort(name) {
  if (!name) return name;
  const m = String(name)
    .trim()
    .match(/^(.+?)\s+cohort\s+(\d+)$/i);
  if (m) return `${m[1]} ${m[2]}`;
  const parts = String(name).trim().split(/\s+/);
  if (parts.length <= 2) return name;
  return `${parts.slice(0, 2).join(" ")}`;
}

export default { shortCohort };
