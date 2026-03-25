import { describe, it, expect } from 'vitest';
import { calcMatchPoints, isPredictionOpen } from '@/lib/scoring';
import type { Fixture, MatchPrediction, MatchSettings } from '@/types/fixture';

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
  winning_team_id: 'team-a',
  mom_player_id: 'player-1',
  highest_scorer_id: 'player-2',
  highest_wicket_taker_id: 'player-3',
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
});

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
});
