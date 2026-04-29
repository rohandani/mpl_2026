'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { calcMatchPoints } from '@/lib/scoring';
import type { Fixture, MatchPrediction, MatchSettings } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  team_win_points: number;
  mom_points: number;
  highest_scorer_points: number;
  highest_wicket_taker_points: number;
  total_points: number;
  submitted_at: string;
  predicted_winner_id: string | null;
  predicted_mom_id: string | null;
  predicted_highest_scorer_id: string | null;
  predicted_highest_wicket_taker_id: string | null;
}

interface Props {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
  prediction: MatchPrediction | null;
  fixture: Fixture;
  settings: MatchSettings;
  teams: Team[];
  players: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>[];
}

const RANK_ICONS = ['🥇', '🥈', '🥉'];

export function MatchLeaderboard({
  leaderboard,
  currentUserId,
  prediction,
  fixture,
  settings,
  teams,
  players,
}: Props) {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const userScore = prediction
    ? calcMatchPoints(prediction, fixture, settings)
    : null;

  function toggle(userId: string) {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  }

  return (
    <div className="space-y-4">
      {/* Your Prediction vs Results */}
      {prediction && (
        <div className="rounded-xl ring-1 ring-border overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <p className="text-sm font-semibold">Your Prediction vs Results</p>
              {userScore && (
                <span className="ml-auto text-lg font-bold text-primary">
                  {userScore.total} pts
                </span>
              )}
            </div>

            <div className="space-y-2">
              <ComparisonRow
                label="🏆 Winner"
                predicted={teamMap.get(prediction.predicted_winner_id ?? '')?.name ?? null}
                actual={teamMap.get(fixture.winning_team_id ?? '')?.name ?? '—'}
                correct={prediction.predicted_winner_id === fixture.winning_team_id && fixture.winning_team_id != null}
                points={userScore?.teamWinPoints ?? 0}
                maxPoints={settings.points_team_win}
              />
              <ComparisonRow
                label="⭐ MoM"
                predicted={playerMap.get(prediction.predicted_mom_id ?? '')?.name ?? null}
                actual={playerMap.get(fixture.mom_player_id ?? '')?.name ?? '—'}
                correct={prediction.predicted_mom_id === fixture.mom_player_id && fixture.mom_player_id != null}
                points={userScore?.momPoints ?? 0}
                maxPoints={settings.points_mom}
              />
              <ComparisonRow
                label="🏏 Top Scorer"
                predicted={playerMap.get(prediction.predicted_highest_scorer_id ?? '')?.name ?? null}
                actual={playerMap.get(fixture.highest_scorer_id ?? '')?.name ?? '—'}
                correct={prediction.predicted_highest_scorer_id === fixture.highest_scorer_id && fixture.highest_scorer_id != null}
                points={userScore?.highestScorerPoints ?? 0}
                maxPoints={settings.points_highest_scorer}
              />
              <ComparisonRow
                label="🎳 Top Wickets"
                predicted={playerMap.get(prediction.predicted_highest_wicket_taker_id ?? '')?.name ?? null}
                actual={playerMap.get(fixture.highest_wicket_taker_id ?? '')?.name ?? '—'}
                correct={prediction.predicted_highest_wicket_taker_id === fixture.highest_wicket_taker_id && fixture.highest_wicket_taker_id != null}
                points={userScore?.highestWicketTakerPoints ?? 0}
                maxPoints={settings.points_highest_wicket_taker}
              />
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="overflow-hidden rounded-xl ring-1 ring-border">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-emerald-500 to-emerald-700" />
        <div className="p-4 pb-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🏆</span>
            <p className="text-sm font-semibold">Match Leaderboard</p>
            <span className="text-xs text-muted-foreground ml-1">
              (tap a row to see predictions)
            </span>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">
            No predictions were made for this match.
          </p>
        ) : (
          <div className="pb-1">
            {/* Header */}
            <div className="grid grid-cols-[2rem_1fr_repeat(4,2rem)_3rem_1.25rem] gap-1 px-4 py-2 border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
              <span>#</span>
              <span>Player</span>
              <span className="text-center">🏆</span>
              <span className="text-center">⭐</span>
              <span className="text-center">🏏</span>
              <span className="text-center">🎳</span>
              <span className="text-right">Total</span>
              <span></span>
            </div>

            {leaderboard.map((entry, i) => {
              const isCurrentUser = entry.user_id === currentUserId;
              const isExpanded = expandedUserId === entry.user_id;

              return (
                <div key={entry.user_id}>
                  <button
                    type="button"
                    onClick={() => toggle(entry.user_id)}
                    className={`w-full grid grid-cols-[2rem_1fr_repeat(4,2rem)_3rem_1.25rem] gap-1 px-4 py-2.5 text-sm border-b border-border last:border-0 transition-colors text-left ${
                      isCurrentUser ? 'bg-amber-50' : 'hover:bg-muted/30'
                    } ${isExpanded ? 'bg-muted/20' : ''}`}
                    aria-expanded={isExpanded}
                  >
                    <span>
                      {i < 3 ? (
                        <span className="text-base">{RANK_ICONS[i]}</span>
                      ) : (
                        <span className="text-muted-foreground">{i + 1}</span>
                      )}
                    </span>
                    <span className="truncate">
                      <span className={`font-semibold ${isCurrentUser ? 'text-foreground' : ''}`}>
                        {entry.display_name}
                      </span>
                      {isCurrentUser && (
                        <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                      )}
                    </span>
                    <span className="text-center text-muted-foreground">{entry.team_win_points}</span>
                    <span className="text-center text-muted-foreground">{entry.mom_points}</span>
                    <span className="text-center text-muted-foreground">{entry.highest_scorer_points}</span>
                    <span className="text-center text-muted-foreground">{entry.highest_wicket_taker_points}</span>
                    <span className="text-right font-bold text-primary">{entry.total_points}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Expanded prediction details */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-muted/10 border-b border-border space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        {entry.display_name}&apos;s Predictions
                      </p>
                      <PredictionDetail
                        label="🏆 Winner"
                        predicted={teamMap.get(entry.predicted_winner_id ?? '')?.name ?? null}
                        actual={teamMap.get(fixture.winning_team_id ?? '')?.name ?? '—'}
                        correct={entry.team_win_points > 0}
                      />
                      <PredictionDetail
                        label="⭐ MoM"
                        predicted={playerMap.get(entry.predicted_mom_id ?? '')?.name ?? null}
                        actual={playerMap.get(fixture.mom_player_id ?? '')?.name ?? '—'}
                        correct={entry.mom_points > 0}
                      />
                      <PredictionDetail
                        label="🏏 Top Scorer"
                        predicted={playerMap.get(entry.predicted_highest_scorer_id ?? '')?.name ?? null}
                        actual={playerMap.get(fixture.highest_scorer_id ?? '')?.name ?? '—'}
                        correct={entry.highest_scorer_points > 0}
                      />
                      <PredictionDetail
                        label="🎳 Top Wickets"
                        predicted={playerMap.get(entry.predicted_highest_wicket_taker_id ?? '')?.name ?? null}
                        actual={playerMap.get(fixture.highest_wicket_taker_id ?? '')?.name ?? '—'}
                        correct={entry.highest_wicket_taker_points > 0}
                      />
                      <p className="text-[11px] text-muted-foreground pt-1">
                        Submitted{' '}
                        {new Date(entry.submitted_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonRow({
  label,
  predicted,
  actual,
  correct,
  points,
  maxPoints,
}: {
  label: string;
  predicted: string | null;
  actual: string;
  correct: boolean;
  points: number;
  maxPoints: number;
}) {
  return (
    <div className={`rounded-lg p-2.5 text-sm ${correct ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-muted/40'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-xs">{label}</span>
        <span className={`text-xs font-semibold ${correct ? 'text-emerald-600' : 'text-muted-foreground'}`}>
          {correct ? '✅' : '❌'} {points}/{maxPoints} pts
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">You predicted: </span>
          <span className="font-medium">{predicted ?? '—'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Actual: </span>
          <span className="font-medium">{actual}</span>
        </div>
      </div>
    </div>
  );
}

function PredictionDetail({
  label,
  predicted,
  actual,
  correct,
}: {
  label: string;
  predicted: string | null;
  actual: string;
  correct: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className={correct ? 'text-emerald-500' : 'text-red-400'}>{correct ? '✅' : '❌'}</span>
      <div className="flex-1">
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-medium">{predicted ?? '—'}</span>
        {!correct && predicted && (
          <span className="text-muted-foreground"> → {actual}</span>
        )}
      </div>
    </div>
  );
}
