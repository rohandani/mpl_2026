'use client';

import { useState } from 'react';
import Link from 'next/link';
import type {
  AuctionLeaderboardEntry,
  MatchesLeaderboardEntry,
  OverallLeaderboardEntry,
} from './page';

type Tab = 'auction' | 'matches' | 'overall';

interface Props {
  auctionEntries: AuctionLeaderboardEntry[];
  matchesEntries: MatchesLeaderboardEntry[];
  overallEntries: OverallLeaderboardEntry[];
  currentUserId: string;
}

const RANK_ICONS = ['🥇', '🥈', '🥉'];

const TABS: { key: Tab; label: string }[] = [
  { key: 'auction', label: 'Auction' },
  { key: 'matches', label: 'Matches' },
  { key: 'overall', label: 'Overall' },
];

export function LeaderboardTable({
  auctionEntries,
  matchesEntries,
  overallEntries,
  currentUserId,
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
        <MatchesTable entries={matchesEntries} currentUserId={currentUserId} />
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
  entries,
  currentUserId,
}: {
  entries: MatchesLeaderboardEntry[];
  currentUserId: string;
}) {
  return (
    <TableWrapper>
      <thead>
        <tr className="border-b border-border bg-muted/40">
          <th className="w-14 py-3 pl-4 text-left font-medium text-muted-foreground">#</th>
          <th className="py-3 text-left font-medium text-muted-foreground">Player</th>
          <th className="py-3 text-center font-medium text-muted-foreground">Matches</th>
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
                {entry.matches_predicted}
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
