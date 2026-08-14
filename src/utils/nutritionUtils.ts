/**
 * Shared Nutrition & Budget Utilities
 * Centralizes date calculations, budget derivations, and localized formatting.
 */

/**
 * Returns a new Date set to midnight (00:00:00.000) of the current local day.
 */
export const getStartOfToday = (): Date => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Derives the daily budget amount from a monthly budget cap assuming a 30-day month.
 * @param monthlyBudgetInr Monthly budget in INR (defaults to 6000)
 * @returns Daily budget in INR
 */
export const deriveDailyBudget = (monthlyBudgetInr?: number): number => {
  const monthly = monthlyBudgetInr ?? 6000;
  return Math.round(monthly / 30);
};

/**
 * Formats a numeric value to Indian numbering system (e.g. 10000 -> "10,000").
 * @param value Number to format
 * @returns Formatted INR string
 */
export const formatINR = (value: number): string => {
  return Math.round(value).toLocaleString('en-IN');
};
