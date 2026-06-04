'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type {
  AuctionLeaderboardEntry,
  OverallLeaderboardEntry,
  UserMatchDetail,
} from './page';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

type Tab = 'auction' | 'matches' | 'overall';

interface Props {
  auctionEntries: AuctionLeaderboardEntry[];
  overallEntries: OverallLeaderboardEntry[];
  currentUserId: string;
  matchDetails: UserMatchDetail[];
  teams: Team[];
  players: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>[];
}

const RANK_ICONS = ['🥇', '🥈', '🥉'];

const TABS: { key: Tab; label: string }[] = [
  { key: 'auction', label: 'Auction' },
  { key: 'matches', label: 'Matches' },
  { key: 'overall', label: 'Overall' },
];

export function LeaderboardTable({
  auctionEntries,
  overallEntries,
  currentUserId,
  matchDetails,
  teams,
  players,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overall');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">🏆</span>
        <div>
          <h1 className="text-2xl font-bold">
            Leader<span className="text-primary">board</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Ranked by total prediction score
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {activeTab === 'auction' && (
        <AuctionTable entries={auctionEntries} currentUserId={currentUserId} />
      )}
      {activeTab === 'matches' && (
        <MatchesTable
          currentUserId={currentUserId}
          matchDetails={matchDetails}
          teams={teams}
          players={players}
        />
      )}
      {activeTab === 'overall' && (
        <OverallTable entries={overallEntries} currentUserId={currentUserId} />
      )}
    </div>
  );
}

function RankCell({ index }: { index: number }) {
  return (
    <td className="py-3 pl-4">
      {index < 3 ? (
        <span className="text-lg">{RANK_ICONS[index]}</span>
      ) : (
        <span className="text-muted-foreground">{index + 1}</span>
      )}
    </td>
  );
}

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-border">
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-emerald-500 to-emerald-700" />
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function PlayerCell({
  name,
  isCurrentUser,
}: {
  name: string;
  isCurrentUser: boolean;
}) {
  return (
    <td className="py-3">
      <span className={`font-semibold ${isCurrentUser ? 'text-foreground' : ''}`}>
        {name}
      </span>
    </td>
  );
}

function ViewScoresCell({ userId, name }: { userId: string; name: string }) {
  return (
    <td className="py-3 pr-4 text-right">
      <Link
        href={`/scores?user=${userId}&name=${encodeURIComponent(name)}&from=leaderboard`}
        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        View 📊
      </Link>
    </td>
  );
}

function AuctionTable({
  entries,
  currentUserId,
}: {
  entries: AuctionLeaderboardEntry[];
  currentUserId: string;
}) {
  return (
    <TableWrapper>
      <thead>
        <tr className="border-b border-border bg-muted/40">
          <th className="w-14 py-3 pl-4 text-left font-medium text-muted-foreground">#</th>
          <th className="py-3 text-left font-medium text-muted-foreground">Player</th>
          <th className="py-3 text-center font-medium text-muted-foreground">Predictions</th>
          <th className="w-24 py-3 pr-4 text-right font-medium text-muted-foreground">Score</th>
          <th className="w-20 py-3 pr-4" />
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, i) => {
          const isCurrentUser = entry.user_id === currentUserId;
          return (
            <tr
              key={entry.user_id}
              className={`border-b border-border last:border-0 transition-colors ${
                isCurrentUser ? 'bg-amber-50' : 'hover:bg-muted/30'
              }`}
            >
              <RankCell index={i} />
              <PlayerCell name={entry.display_name} isCurrentUser={isCurrentUser} />
              <td className="py-3 text-center text-muted-foreground">
                {entry.predictions_count}
              </td>
              <td className="py-3 pr-4 text-right">
                <span className="font-bold text-primary">{entry.total_points}</span>
              </td>
              <ViewScoresCell userId={entry.user_id} name={entry.display_name} />
            </tr>
          );
        })}
      </tbody>
    </TableWrapper>
  );
}

function MatchesTable({
  matchDetails,
  currentUserId,
  teams,
  players,
}: {
  matchDetails: UserMatchDetail[];
  currentUserId: string;
  teams: Team[];
  players: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>[];
}) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const playerMap = new Map(players.map((p) => [p.id, p]));

  // Group by fixture, preserving match_number order from the RPC
  const matchesMap = new Map<
    string,
    { match_number: number; team_a_id: string; team_b_id: string; match_date: string; users: UserMatchDetail[] }
  >();
  for (const d of matchDetails) {
    if (!matchesMap.has(d.fixture_id)) {
      matchesMap.set(d.fixture_id, {
        match_number: d.match_number,
        team_a_id: d.team_a_id,
        team_b_id: d.team_b_id,
        match_date: d.match_date,
        users: [],
      });
    }
    matchesMap.get(d.fixture_id)!.users.push(d);
  }

  // Sort matches by match_number, users already sorted by total_points DESC from RPC
  const matches = Array.from(matchesMap.entries()).sort(
    (a, b) => a[1].match_number - b[1].match_number
  );

  if (matches.length === 0) {
    return (
      <div className="rounded-xl ring-1 ring-border p-6 text-center text-sm text-muted-foreground">
        No completed match predictions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map(([fixtureId, match]) => {
        const teamA = teamMap.get(match.team_a_id);
        const teamB = teamMap.get(match.team_b_id);

        return (
          <div key={fixtureId} className="overflow-hidden rounded-xl ring-1 ring-border">
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-emerald-500 to-emerald-700" />
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Match #{match.match_number}
                  </span>
                  <span className="text-sm font-semibold">
                    {teamA?.name ?? '?'} vs {teamB?.name ?? '?'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(match.match_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>

            {/* Users ranked by score */}
            <div>
              {match.users.map((entry, i) => {
                const isCurrentUser = entry.user_id === currentUserId;
                const key = `${fixtureId}-${entry.user_id}`;
                const isExpanded = expandedKey === key;

                return (
                  <div key={entry.user_id} className="border-b border-border last:border-0">
                    <button
                      type="button"
                      onClick={() => setExpandedKey(isExpanded ? null : key)}
                      className={`w-full grid grid-cols-[2rem_1fr_3rem_1.25rem] gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
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
                      <span className="text-right font-bold text-primary">
                        {entry.total_points}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 self-center ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-4 py-3 bg-muted/10 border-t border-border space-y-1.5">
                        <PredictionLine
                          label="🏆 Winner"
                          predicted={teamMap.get(entry.predicted_winner_id ?? '')?.name ?? null}
                          actual={teamMap.get(entry.winning_team_id ?? '')?.name ?? '—'}
                          correct={entry.team_win_points > 0}
                        />
                        <PredictionLine
                          label="⭐ MoM"
                          predicted={playerMap.get(entry.predicted_mom_id ?? '')?.name ?? null}
                          actual={playerMap.get(entry.mom_player_id ?? '')?.name ?? '—'}
                          correct={entry.mom_points > 0}
                        />
                        <PredictionLine
                          label="🏏 Top Scorer"
                          predicted={playerMap.get(entry.predicted_highest_scorer_id ?? '')?.name ?? null}
                          actual={playerMap.get(entry.highest_scorer_id ?? '')?.name ?? '—'}
                          correct={entry.highest_scorer_points > 0}
                        />
                        <PredictionLine
                          label="🎳 Top Wickets"
                          predicted={playerMap.get(entry.predicted_highest_wicket_taker_id ?? '')?.name ?? null}
                          actual={playerMap.get(entry.highest_wicket_taker_id ?? '')?.name ?? '—'}
                          correct={entry.highest_wicket_taker_points > 0}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PredictionLine({
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
    <div className="flex items-start gap-1.5 text-xs">
      <span className={correct ? 'text-emerald-500' : 'text-red-400'}>
        {correct ? '✅' : '❌'}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-medium">{predicted ?? '—'}</span>
        {!correct && predicted && (
          <span className="text-muted-foreground"> → {actual}</span>
        )}
      </div>
    </div>
  );
}

function OverallTable({
  entries,
  currentUserId,
}: {
  entries: OverallLeaderboardEntry[];
  currentUserId: string;
}) {
  const leader = entries.length > 0 ? entries[0] : null;

  return (
    <>
      {leader && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-2xl">👑</span>
          <div>
            <p className="text-sm text-muted-foreground">Tournament Leader</p>
            <p className="font-bold">{leader.display_name}</p>
          </div>
          <span className="ml-auto text-lg font-bold text-primary">
            {leader.total_points} pts
          </span>
        </div>
      )}
      <TableWrapper>
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="w-14 py-3 pl-4 text-left font-medium text-muted-foreground">#</th>
            <th className="py-3 text-left font-medium text-muted-foreground">Player</th>
            <th className="py-3 text-center font-medium text-muted-foreground">Auction</th>
            <th className="py-3 text-center font-medium text-muted-foreground">Matches</th>
            <th className="w-24 py-3 pr-4 text-right font-medium text-muted-foreground">Total</th>
            <th className="w-20 py-3 pr-4" />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const isCurrentUser = entry.user_id === currentUserId;
            return (
              <tr
                key={entry.user_id}
                className={`border-b border-border last:border-0 transition-colors ${
                  isCurrentUser ? 'bg-amber-50' : 'hover:bg-muted/30'
                }`}
              >
                <RankCell index={i} />
                <PlayerCell name={entry.display_name} isCurrentUser={isCurrentUser} />
                <td className="py-3 text-center text-muted-foreground">
                  {entry.auction_points}
                </td>
                <td className="py-3 text-center text-muted-foreground">
                  {entry.match_points}
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="font-bold text-primary">{entry.total_points}</span>
                </td>
                <ViewScoresCell userId={entry.user_id} name={entry.display_name} />
              </tr>
            );
          })}
        </tbody>
      </TableWrapper>
    </>
  );
}
