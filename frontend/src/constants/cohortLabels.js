/**
 * Cohort strings match backend `employee.cohort` / sprint pairs:
 * "{Technology} cohort {n}" (e.g. Java cohort 1).
 */
export const TECH_COHORTS = {
  Java:       ["Java cohort 1", "Java cohort 2", "Java cohort 3"],
  Python:     ["Python cohort 1", "Python cohort 2", "Python cohort 3"],
  Devops:     ["Devops cohort 1", "Devops cohort 2"],
  DotNet:     ["DotNet cohort 1", "DotNet cohort 2"],
  SalesForce: ["SalesForce cohort 1", "SalesForce cohort 2"],
};

/** Flat list for generic dropdowns (HR sprint edit, etc.) */
export const ALL_COHORT_OPTIONS = [...new Set(Object.values(TECH_COHORTS).flat())].sort((a, b) =>
  a.localeCompare(b)
);

/** Old demo labels — removed from persisted HR cohort list so UI matches DB */
export const LEGACY_COHORT_NAMES = new Set([
  "Cohort A",
  "Cohort B",
  "Cohort C",
  "cohortA",
  "cohortB",
]);
