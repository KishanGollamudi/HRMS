/**
 * Count employees whose technology+cohort match a sprint's cohort pairs.
 *
 * Matching strategy (in order):
 * 1. Exact technology + cohort match against sprint.cohorts[] pairs
 * 2. Fallback: employee.technology matches sprint.title (e.g. "Python Sprint - PC1" → "Python")
 *    combined with cohort containing the sprint cohort abbreviation
 */
export function countEmployeesForSprint(sprint, employees) {
  if (!sprint || !Array.isArray(employees) || employees.length === 0) return 0;

  const pairs = sprint.cohorts?.length
    ? sprint.cohorts
    : [{ technology: sprint.technology || "", cohort: sprint.cohort || "" }];

  // Strategy 1: exact technology + cohort match
  const exactMatches = employees.filter((emp) =>
    pairs.some(
      (pair) =>
        String(pair.technology || "").toLowerCase() === String(emp.technology || "").toLowerCase() &&
        String(pair.cohort || "").toLowerCase() === String(emp.cohort || "").toLowerCase()
    )
  );

  if (exactMatches.length > 0) return exactMatches.length;

  // Strategy 2: sprint title contains employee technology (e.g. "Python Sprint - PC1" contains "Python")
  // AND sprint cohort abbreviation appears in employee cohort (e.g. "PC1" in "Python cohort 1")
  const titleLower = String(sprint.title || "").toLowerCase();
  return employees.filter((emp) => {
    const techLower   = String(emp.technology || "").toLowerCase();
    const cohortLower = String(emp.cohort || "").toLowerCase();

    // Check if sprint title contains the employee's technology
    if (!titleLower.includes(techLower)) return false;

    // Check cohort: try each pair's cohort against employee cohort
    return pairs.some((pair) => {
      const pairCohort = String(pair.cohort || "").toLowerCase();
      if (!pairCohort) return true; // no cohort constraint
      // Direct contains check both ways
      return cohortLower.includes(pairCohort) || pairCohort.includes(cohortLower);
    });
  }).length;
}
