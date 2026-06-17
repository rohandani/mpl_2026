import { describe, it, expect } from 'vitest';
import {
  calcPricePoints,
  calcTotalPoints,
  calcMatchPoints,
  isPredictionOpen,
  TEAM_POINTS,
  MAX_PRICE_POINTS,
} from '@/lib/scoring';
import type { Fixture, MatchPrediction, MatchSettings } from '@/types/fixture';

// ─── Match scoring helpers ───────────────────────────────────

const defaultSettings: MatchSettings = {
  id: 'default',
  prediction_deadline_minutes: 15,
  points_team_win: 10,
  points_mom: 15,
  points_highest_scorer: 15,
  points_highest_wicket_taker: 10,
  updated_at: '2026-03-01T00:00:00Z',
};

const completedFixture: Fixture = {
  id: 'fixture-1',
  match_number: 1,
  team_a_id: 'team-a',
  team_b_id: 'team-b',
  match_date: '2026-04-01T14:00:00Z',
  venue: 'Stadium',
  status: 'completed',
  stage: 'Group Stage',
  winning_team_id: 'team-a',
  mom_player_id: 'player-1',
  highest_scorer_id: 'player-2',
  highest_wicket_taker_id: 'player-3',
  predictions_locked: false,
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
};

function makePrediction(overrides: Partial<MatchPrediction> = {}): MatchPrediction {
  return {
    id: 'pred-1',
    user_id: 'user-1',
    fixture_id: 'fixture-1',
    predicted_winner_id: null,
    predicted_mom_id: null,
    predicted_highest_scorer_id: null,
    predicted_highest_wicket_taker_id: null,
    created_at: '2026-03-20T00:00:00Z',
    updated_at: '2026-03-20T00:00:00Z',
    ...overrides,
  };
}

// ─── Auction price scoring ───────────────────────────────────

describe('calcPricePoints', () => {
  it('returns 30 for an exact price match', () => {
    expect(calcPricePoints(5000, 5000)).toBe(30);
  });

  it('returns 20 for 10% off', () => {
    // 10% off → 30 - 10 = 20
    expect(calcPricePoints(4500, 5000)).toBe(20);
    expect(calcPricePoints(5500, 5000)).toBe(20);
  });

  it('returns 10 for 20% off', () => {
    expect(calcPricePoints(4000, 5000)).toBe(10);
  });

  it('returns 0 for 30% or more off', () => {
    expect(calcPricePoints(3500, 5000)).toBe(0);
    expect(calcPricePoints(7000, 5000)).toBe(0);
  });

  it('returns 0 when predicted is wildly off', () => {
    expect(calcPricePoints(50000, 1000)).toBe(0);
  });

  it('handles actual price of 0 — exact match gives full points', () => {
    expect(calcPricePoints(0, 0)).toBe(30);
  });

  it('handles actual price of 0 — any non-zero prediction gives 0', () => {
    expect(calcPricePoints(100, 0)).toBe(0);
  });

  it('handles small prices correctly', () => {
    // predicted 900, actual 1000 → 10% off → 20 pts
    expect(calcPricePoints(900, 1000)).toBe(20);
  });

  it('caps at MAX_PRICE_POINTS and never goes negative', () => {
    const result = calcPricePoints(1000, 1000);
    expect(result).toBeLessThanOrEqual(MAX_PRICE_POINTS);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

describe('calcTotalPoints', () => {
  it('awards team + price points when both correct', () => {
    const result = calcTotalPoints(5000, 'team-a', 5000, 'team-a');
    expect(result.teamPoints).toBe(TEAM_POINTS); // 20
    expect(result.pricePoints).toBe(30);
    expect(result.total).toBe(50);
  });

  it('awards only price points when team is wrong', () => {
    const result = calcTotalPoints(5000, 'team-a', 5000, 'team-b');
    expect(result.teamPoints).toBe(0);
    expect(result.pricePoints).toBe(30);
    expect(result.total).toBe(30);
  });

  it('awards only team points when price is way off', () => {
    const result = calcTotalPoints(50000, 'team-a', 1000, 'team-a');
    expect(result.teamPoints).toBe(TEAM_POINTS);
    expect(result.pricePoints).toBe(0);
    expect(result.total).toBe(20);
  });

  it('awards 0 when both wrong', () => {
    const result = calcTotalPoints(50000, 'team-a', 1000, 'team-b');
    expect(result.teamPoints).toBe(0);
    expect(result.pricePoints).toBe(0);
    expect(result.total).toBe(0);
  });
});

// ─── Match prediction scoring ────────────────────────────────

describe('calcMatchPoints', () => {
  it('awards full points when all predictions are correct', () => {
    const prediction = makePrediction({
      predicted_winner_id: 'team-a',
      predicted_mom_id: 'player-1',
      predicted_highest_scorer_id: 'player-2',
      predicted_highest_wicket_taker_id: 'player-3',
    });
    const result = calcMatchPoints(prediction, completedFixture, defaultSettings);
    expect(result.teamWinPoints).toBe(10);
    expect(result.momPoints).toBe(15);
    expect(result.highestScorerPoints).toBe(15);
    expect(result.highestWicketTakerPoints).toBe(10);
    expect(result.total).toBe(50);
  });

  it('awards zero points when all predictions are wrong', () => {
    const prediction = makePrediction({
      predicted_winner_id: 'team-b',
      predicted_mom_id: 'player-99',
      predicted_highest_scorer_id: 'player-99',
      predicted_highest_wicket_taker_id: 'player-99',
    });
    const result = calcMatchPoints(prediction, completedFixture, defaultSettings);
    expect(result.teamWinPoints).toBe(0);
    expect(result.momPoints).toBe(0);
    expect(result.highestScorerPoints).toBe(0);
    expect(result.highestWicketTakerPoints).toBe(0);
    expect(result.total).toBe(0);
  });

  it('awards partial points for partially correct predictions', () => {
    const prediction = makePrediction({
      predicted_winner_id: 'team-a',
      predicted_mom_id: 'player-wrong',
      predicted_highest_scorer_id: 'player-2',
      predicted_highest_wicket_taker_id: 'player-wrong',
    });
    const result = calcMatchPoints(prediction, completedFixture, defaultSettings);
    expect(result.teamWinPoints).toBe(10);
    expect(result.momPoints).toBe(0);
    expect(result.highestScorerPoints).toBe(15);
    expect(result.highestWicketTakerPoints).toBe(0);
    expect(result.total).toBe(25);
  });

  it('awards zero for null predictions (partial submission)', () => {
    const prediction = makePrediction({
      predicted_winner_id: 'team-a',
    });
    const result = calcMatchPoints(prediction, completedFixture, defaultSettings);
    expect(result.teamWinPoints).toBe(10);
    expect(result.momPoints).toBe(0);
    expect(result.highestScorerPoints).toBe(0);
    expect(result.highestWicketTakerPoints).toBe(0);
    expect(result.total).toBe(10);
  });

  it('uses custom point values from settings', () => {
    const customSettings: MatchSettings = {
      ...defaultSettings,
      points_team_win: 20,
      points_mom: 30,
      points_highest_scorer: 25,
      points_highest_wicket_taker: 5,
    };
    const prediction = makePrediction({
      predicted_winner_id: 'team-a',
      predicted_mom_id: 'player-1',
      predicted_highest_scorer_id: 'player-2',
      predicted_highest_wicket_taker_id: 'player-3',
    });
    const result = calcMatchPoints(prediction, completedFixture, customSettings);
    expect(result.total).toBe(80);
  });

  it('does not award points when fixture result fields are null', () => {
    const noResultFixture: Fixture = {
      ...completedFixture,
      winning_team_id: null,
      mom_player_id: null,
      highest_scorer_id: null,
      highest_wicket_taker_id: null,
    };
    const prediction = makePrediction({
      predicted_winner_id: 'team-a',
      predicted_mom_id: 'player-1',
      predicted_highest_scorer_id: 'player-2',
      predicted_highest_wicket_taker_id: 'player-3',
    });
    const result = calcMatchPoints(prediction, noResultFixture, defaultSettings);
    expect(result.total).toBe(0);
  });

  it('does not award points when both prediction and result are null (no false positive)', () => {
    const noResultFixture: Fixture = {
      ...completedFixture,
      winning_team_id: null,
      mom_player_id: null,
      highest_scorer_id: null,
      highest_wicket_taker_id: null,
    };
    const prediction = makePrediction(); // all nulls
    const result = calcMatchPoints(prediction, noResultFixture, defaultSettings);
    expect(result.total).toBe(0);
  });

  it('handles zero-point settings gracefully', () => {
    const zeroSettings: MatchSettings = {
      ...defaultSettings,
      points_team_win: 0,
      points_mom: 0,
      points_highest_scorer: 0,
      points_highest_wicket_taker: 0,
    };
    const prediction = makePrediction({
      predicted_winner_id: 'team-a',
      predicted_mom_id: 'player-1',
      predicted_highest_scorer_id: 'player-2',
      predicted_highest_wicket_taker_id: 'player-3',
    });
    const result = calcMatchPoints(prediction, zeroSettings as unknown as Fixture, zeroSettings);
    // Even all correct, 0-point settings = 0 total
    expect(calcMatchPoints(prediction, completedFixture, zeroSettings).total).toBe(0);
  });

  it('awards only MoM points when only MoM is correct', () => {
    const prediction = makePrediction({
      predicted_winner_id: 'team-b',
      predicted_mom_id: 'player-1',
      predicted_highest_scorer_id: 'player-wrong',
      predicted_highest_wicket_taker_id: 'player-wrong',
    });
    const result = calcMatchPoints(prediction, completedFixture, defaultSettings);
    expect(result.teamWinPoints).toBe(0);
    expect(result.momPoints).toBe(15);
    expect(result.highestScorerPoints).toBe(0);
    expect(result.highestWicketTakerPoints).toBe(0);
    expect(result.total).toBe(15);
  });

  it('awards only highest wicket taker points when only that is correct', () => {
    const prediction = makePrediction({
      predicted_winner_id: 'team-b',
      predicted_mom_id: 'player-wrong',
      predicted_highest_scorer_id: 'player-wrong',
      predicted_highest_wicket_taker_id: 'player-3',
    });
    const result = calcMatchPoints(prediction, completedFixture, defaultSettings);
    expect(result.total).toBe(10);
    expect(result.highestWicketTakerPoints).toBe(10);
  });
});

// ─── Prediction deadline ─────────────────────────────────────

describe('isPredictionOpen', () => {
  const upcomingFixture: Fixture = {
    ...completedFixture,
    status: 'upcoming',
    match_date: '2026-04-01T14:00:00Z',
  };

  it('returns true when current time is before the deadline', () => {
    const now = new Date('2026-04-01T13:00:00Z'); // 60 min before match
    expect(isPredictionOpen(upcomingFixture, 15, now)).toBe(true);
  });

  it('returns false when current time is after the deadline', () => {
    const now = new Date('2026-04-01T13:50:00Z'); // 10 min before match
    expect(isPredictionOpen(upcomingFixture, 15, now)).toBe(false);
  });

  it('returns false exactly at the deadline', () => {
    const now = new Date('2026-04-01T13:45:00Z'); // exactly 15 min before
    expect(isPredictionOpen(upcomingFixture, 15, now)).toBe(false);
  });

  it('returns false for completed fixtures', () => {
    const now = new Date('2026-03-01T00:00:00Z');
    expect(isPredictionOpen(completedFixture, 15, now)).toBe(false);
  });

  it('returns false for live fixtures', () => {
    const liveFixture: Fixture = { ...upcomingFixture, status: 'live' };
    const now = new Date('2026-03-01T00:00:00Z');
    expect(isPredictionOpen(liveFixture, 15, now)).toBe(false);
  });

  it('respects custom deadline minutes', () => {
    const now = new Date('2026-04-01T13:20:00Z'); // 40 min before match
    expect(isPredictionOpen(upcomingFixture, 30, now)).toBe(true); // deadline at 13:30
    expect(isPredictionOpen(upcomingFixture, 45, now)).toBe(false); // deadline at 13:15
  });

  it('returns true when deadline is 0 minutes and time is before match', () => {
    const now = new Date('2026-04-01T13:59:59Z');
    expect(isPredictionOpen(upcomingFixture, 0, now)).toBe(true);
  });

  it('returns false when deadline is 0 minutes and time is at match start', () => {
    const now = new Date('2026-04-01T14:00:00Z');
    expect(isPredictionOpen(upcomingFixture, 0, now)).toBe(false);
  });

  it('returns false when predictions are manually locked by admin', () => {
    const lockedFixture: Fixture = { ...upcomingFixture, predictions_locked: true };
    const now = new Date('2026-04-01T13:00:00Z'); // well before deadline
    expect(isPredictionOpen(lockedFixture, 15, now)).toBe(false);
  });
});
