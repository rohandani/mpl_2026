'use client';

import { calcMatchPoints } from '@/lib/scoring';
import type { Fixture, MatchPrediction, MatchSettings } from '@/types/fixture';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  team_win_points: number;
  mom_points: number;
  highest_scorer_points: number;
  highest_wicket_taker_points: number;
  total_points: number;
}

interface Props {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
  prediction: MatchPrediction | null;
  fixture: Fixture;
  settings: MatchSettings;
}

const RANK_ICONS = ['🥇', '🥈', '🥉'];

export function MatchLeaderboard({
  leaderboard,
  currentUserId,
  prediction,
  fixture,
  settings,
}: Props) {
  // Show user's own score breakdown if they have a prediction
  const userScore = prediction
    ? calcMatchPoints(prediction, fixture, settings)
    : null;

  return (
    <div className="space-y-4">
      {/* User's score breakdown */}
      {userScore && (
        <div className="rounded-xl ring-1 ring-border overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <p className="text-sm font-semibold">Your Score</p>
              <span className="ml-auto text-lg font-bold text-primary">
                {userScore.total} pts
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>🏆 Team Win: {userScore.teamWinPoints} pts</span>
              <span>⭐ MoM: {userScore.momPoints} pts</span>
              <span>🏏 Highest Scorer: {userScore.highestScorerPoints} pts</span>
              <span>🎳 Highest Wicket Taker: {userScore.highestWicketTakerPoints} pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="overflow-hidden rounded-xl ring-1 ring-border">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-emerald-500 to-emerald-700" />
        <div className="p-4 pb-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🏆</span>
            <p className="text-sm font-semibold">Match Leaderboard</p>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">
            No predictions were made for this match.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-12 py-2 pl-4 text-left font-medium text-muted-foreground">#</th>
                <th className="py-2 text-left font-medium text-muted-foreground">Player</th>
                <th className="py-2 text-center font-medium text-muted-foreground text-xs">🏆</th>
                <th className="py-2 text-center font-medium text-muted-foreground text-xs">⭐</th>
                <th className="py-2 text-center font-medium text-muted-foreground text-xs">🏏</th>
                <th className="py-2 text-center font-medium text-muted-foreground text-xs">🎳</th>
                <th className="w-20 py-2 pr-4 text-right font-medium text-muted-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => {
                const isCurrentUser = entry.user_id === currentUserId;
                return (
                  <tr
                    key={entry.user_id}
                    className={`border-b border-border last:border-0 transition-colors ${
                      isCurrentUser ? 'bg-amber-50' : 'hover:bg-muted/30'
                    }`}
                  >
                    <td className="py-2 pl-4">
                      {i < 3 ? (
                        <span className="text-base">{RANK_ICONS[i]}</span>
                      ) : (
                        <span className="text-muted-foreground">{i + 1}</span>
                      )}
                    </td>
                    <td className="py-2">
                      <span className={`font-semibold ${isCurrentUser ? 'text-foreground' : ''}`}>
                        {entry.display_name}
                        {isCurrentUser && (
                          <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                        )}
                      </span>
                    </td>
                    <td className="py-2 text-center text-muted-foreground">
                      {entry.team_win_points}
                    </td>
                    <td className="py-2 text-center text-muted-foreground">
                      {entry.mom_points}
                    </td>
                    <td className="py-2 text-center text-muted-foreground">
                      {entry.highest_scorer_points}
                    </td>
                    <td className="py-2 text-center text-muted-foreground">
                      {entry.highest_wicket_taker_points}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <span className="font-bold text-primary">{entry.total_points}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
