import type { Fixture, MatchPrediction, MatchSettings } from '@/types/fixture';

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


/**
 * Match Prediction Scoring
 *
 * Compares a user's match prediction against actual fixture results
 * using configurable point values from match_settings.
 */
export function calcMatchPoints(
  prediction: MatchPrediction,
  fixture: Fixture,
  settings: MatchSettings
): {
  teamWinPoints: number;
  momPoints: number;
  highestScorerPoints: number;
  highestWicketTakerPoints: number;
  total: number;
} {
  const teamWinPoints =
    prediction.predicted_winner_id != null &&
      prediction.predicted_winner_id === fixture.winning_team_id
      ? settings.points_team_win
      : 0;

  const momPoints =
    prediction.predicted_mom_id != null &&
      prediction.predicted_mom_id === fixture.mom_player_id
      ? settings.points_mom
      : 0;

  const highestScorerPoints =
    prediction.predicted_highest_scorer_id != null &&
      prediction.predicted_highest_scorer_id === fixture.highest_scorer_id
      ? settings.points_highest_scorer
      : 0;

  const highestWicketTakerPoints =
    prediction.predicted_highest_wicket_taker_id != null &&
      prediction.predicted_highest_wicket_taker_id === fixture.highest_wicket_taker_id
      ? settings.points_highest_wicket_taker
      : 0;

  return {
    teamWinPoints,
    momPoints,
    highestScorerPoints,
    highestWicketTakerPoints,
    total: teamWinPoints + momPoints + highestScorerPoints + highestWicketTakerPoints,
  };
}

/**
 * Checks whether predictions are still open for a fixture.
 * Predictions close `deadlineMinutes` before the match start time.
 * Only upcoming fixtures can have open predictions.
 */
export function isPredictionOpen(
  fixture: Fixture,
  deadlineMinutes: number,
  now: Date = new Date()
): boolean {
  if (fixture.status !== 'upcoming') return false;
  const deadline = new Date(fixture.match_date);
  deadline.setMinutes(deadline.getMinutes() - deadlineMinutes);
  return now < deadline;
}
