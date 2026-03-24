/**
 * MPL 2026 Prediction Scoring
 *
 * Team prediction: 20 points for correct team.
 *
 * Price prediction: up to 30 points based on accuracy.
 * Formula: max(0, 30 - (|predicted - actual| / actual) * 100)
 *   - Exact match = 30 pts
 *   - 10% off = 20 pts
 *   - 20% off = 10 pts
 *   - 30%+ off = 0 pts
 *
 * Max possible per player: 50 points.
 */

export const TEAM_POINTS = 20;
export const MAX_PRICE_POINTS = 30;

export function calcPricePoints(predicted: number, actual: number): number {
  if (actual === 0) return predicted === 0 ? MAX_PRICE_POINTS : 0;
  const pctOff = Math.abs(predicted - actual) / actual;
  const points = MAX_PRICE_POINTS - pctOff * 100;
  return Math.round(Math.max(0, Math.min(MAX_PRICE_POINTS, points)) * 10) / 10;
}

export function calcTotalPoints(
  predictedPrice: number,
  predictedTeamId: string,
  actualPrice: number,
  actualTeamId: string
): { teamPoints: number; pricePoints: number; total: number } {
  const teamPoints = predictedTeamId === actualTeamId ? TEAM_POINTS : 0;
  const pricePoints = calcPricePoints(predictedPrice, actualPrice);
  return { teamPoints, pricePoints, total: teamPoints + pricePoints };
}
