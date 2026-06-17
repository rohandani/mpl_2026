'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, TrendingUp, Users, Target, Eye } from 'lucide-react';
import type { Fixture } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';
import type { PlayerToWatch, HighlightType } from '@/types/player-to-watch';
import { HIGHLIGHT_TYPE_LABELS, HIGHLIGHT_TYPE_COLORS } from '@/types/player-to-watch';

interface PlayerStats {
  player: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>;
  momCount: number;
  highestScorerCount: number;
  wicketTakerCount: number;
  totalAwards: number;
}

interface TeamStats {
  team: Team;
  wins: number;
  totalMatches: number;
  winPercentage: number;
}

interface HeadToHeadStats {
  teamA: Team;
  teamB: Team;
  teamAWins: number;
  teamBWins: number;
  totalMatches: number;
  lastFiveResults: { winner: Team; match: number }[];
}

interface Props {
  currentFixture: Fixture;
  teams: Team[];
  players: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>[];
  completedFixtures: Fixture[];
  playersToWatch: (PlayerToWatch & {
    player: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>;
  })[];
  matchSettings: { show_historical_insights: boolean };
}

export function HistoricalInsights({ currentFixture, teams, players, completedFixtures, playersToWatch, matchSettings }: Props) {
  const [activeTab, setActiveTab] = useState<'h2h' | 'players' | 'teams'>('h2h');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const currentTeamA = teamMap.get(currentFixture.team_a_id);
  const currentTeamB = teamMap.get(currentFixture.team_b_id);

  if (!currentTeamA || !currentTeamB) return null;

  // Don't render complex calculations on server to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="space-y-4">
        {/* Players to Watch - Always shown */}
        <PlayersToWatchSection
          playersToWatch={playersToWatch}
          teamA={currentTeamA}
          teamB={currentTeamB}
        />
      </div>
    );
  }

  // Calculate Head-to-Head stats
  const h2hMatches = completedFixtures.filter(
    (f) =>
      (f.team_a_id === currentFixture.team_a_id && f.team_b_id === currentFixture.team_b_id) ||
      (f.team_a_id === currentFixture.team_b_id && f.team_b_id === currentFixture.team_a_id)
  );

  const teamAH2HWins = h2hMatches.filter((f) => f.winning_team_id === currentFixture.team_a_id).length;
  const teamBH2HWins = h2hMatches.filter((f) => f.winning_team_id === currentFixture.team_b_id).length;

  const lastFiveH2H = h2hMatches
    .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
    .slice(0, 5)
    .map((f) => ({
      winner: teamMap.get(f.winning_team_id ?? '')!,
      match: f.match_number,
      date: f.match_date
    }))
    .filter((r) => r.winner);

  // Calculate player performance stats
  const currentTeamPlayers = players.filter(
    (p) => p.team_id === currentFixture.team_a_id || p.team_id === currentFixture.team_b_id
  );

  const playerStats = currentTeamPlayers.map((player) => {
    const momCount = completedFixtures.filter((f) => f.mom_player_id === player.id).length;
    const highestScorerCount = completedFixtures.filter((f) => f.highest_scorer_id === player.id).length;
    const wicketTakerCount = completedFixtures.filter((f) => f.highest_wicket_taker_id === player.id).length;

    return {
      player,
      momCount,
      highestScorerCount,
      wicketTakerCount,
      totalAwards: momCount + highestScorerCount + wicketTakerCount,
    };
  });

  const topPerformers = playerStats
    .filter((p) => p.totalAwards > 0)
    .sort((a, b) => b.totalAwards - a.totalAwards)
    .slice(0, 6);

  // Calculate team overall stats
  const teamAMatches = completedFixtures.filter(
    (f) => f.team_a_id === currentFixture.team_a_id || f.team_b_id === currentFixture.team_a_id
  );
  const teamAWins = teamAMatches.filter((f) => f.winning_team_id === currentFixture.team_a_id).length;

  const teamBMatches = completedFixtures.filter(
    (f) => f.team_a_id === currentFixture.team_b_id || f.team_b_id === currentFixture.team_b_id
  );
  const teamBWins = teamBMatches.filter((f) => f.winning_team_id === currentFixture.team_b_id).length;

  const teamAStats: TeamStats = {
    team: currentTeamA,
    wins: teamAWins,
    totalMatches: teamAMatches.length,
    winPercentage: teamAMatches.length > 0 ? Math.round((teamAWins / teamAMatches.length) * 100) : 0,
  };

  const teamBStats: TeamStats = {
    team: currentTeamB,
    wins: teamBWins,
    totalMatches: teamBMatches.length,
    winPercentage: teamBMatches.length > 0 ? Math.round((teamBWins / teamBMatches.length) * 100) : 0,
  };

  return (
    <div className="space-y-4">
      {/* Players to Watch - Always shown */}
      <PlayersToWatchSection
        playersToWatch={playersToWatch}
        teamA={currentTeamA}
        teamB={currentTeamB}
      />

      {/* Historical Insights - Only if data available and setting enabled */}
      {completedFixtures.length > 0 && matchSettings.show_historical_insights && (
        <HistoricalDataSection
          currentFixture={currentFixture}
          currentTeamA={currentTeamA}
          currentTeamB={currentTeamB}
          completedFixtures={completedFixtures}
          h2hMatches={h2hMatches}
          teamAH2HWins={teamAH2HWins}
          teamBH2HWins={teamBH2HWins}
          lastFiveH2H={lastFiveH2H}
          topPerformers={topPerformers}
          teamAStats={teamAStats}
          teamBStats={teamBStats}
        />
      )}
    </div>
  );
}

function PlayersToWatchSection({
  playersToWatch,
  teamA,
  teamB
}: {
  playersToWatch: (PlayerToWatch & { player: Pick<Player, 'id' | 'name' | 'role' | 'team_id'> })[];
  teamA: Team;
  teamB: Team;
}) {
  return (
    <div className="rounded-xl ring-1 ring-border overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />

      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold">Players to Watch</span>
        </div>

        {playersToWatch.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/60 flex items-center justify-center">
              <Target className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Keep an eye on these teams
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Key players and match insights will appear here before the game
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="font-semibold text-blue-900">{teamA.name}</p>
                <p className="text-xs text-blue-600 mt-1">Check their form & key players</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                <p className="font-semibold text-purple-900">{teamB.name}</p>
                <p className="text-xs text-purple-600 mt-1">Watch for standout performers</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {playersToWatch
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((ptw) => (
                <PlayerToWatchCard
                  key={ptw.id}
                  playerToWatch={ptw}
                  teamA={teamA}
                  teamB={teamB}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerToWatchCard({
  playerToWatch,
  teamA,
  teamB
}: {
  playerToWatch: PlayerToWatch & { player: Pick<Player, 'id' | 'name' | 'role' | 'team_id'> };
  teamA: Team;
  teamB: Team;
}) {
  const isTeamA = playerToWatch.player.team_id === teamA.id;
  const team = isTeamA ? teamA : teamB;
  const bgColor = isTeamA ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200';

  return (
    <div className={`border rounded-lg p-3 ${bgColor}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Image
            src={team.logo}
            alt={`${team.name} logo`}
            width={24}
            height={24}
            className="flex-shrink-0 rounded"
          />
          <span className="font-semibold text-sm truncate">
            {playerToWatch.player.name}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            ({playerToWatch.player.role})
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {team.name}
          </span>
        </div>

        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${HIGHLIGHT_TYPE_COLORS[playerToWatch.highlight_type]}`}>
          {HIGHLIGHT_TYPE_LABELS[playerToWatch.highlight_type]}
        </span>
      </div>

      {playerToWatch.description && (
        <p className="text-xs text-muted-foreground mt-2 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {playerToWatch.description}
        </p>
      )}
    </div>
  );
}

function HistoricalDataSection({
  currentFixture,
  currentTeamA,
  currentTeamB,
  completedFixtures,
  h2hMatches,
  teamAH2HWins,
  teamBH2HWins,
  lastFiveH2H,
  topPerformers,
  teamAStats,
  teamBStats,
}: {
  currentFixture: Fixture;
  currentTeamA: Team;
  currentTeamB: Team;
  completedFixtures: Fixture[];
  h2hMatches: Fixture[];
  teamAH2HWins: number;
  teamBH2HWins: number;
  lastFiveH2H: { winner: Team; match: number; date: string }[];
  topPerformers: PlayerStats[];
  teamAStats: TeamStats;
  teamBStats: TeamStats;
}) {
  const [activeTab, setActiveTab] = useState<'h2h' | 'players' | 'teams'>('h2h');

  if (completedFixtures.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl ring-1 ring-border overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-500" />

      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">Historical Insights</span>
          <span className="text-xs text-muted-foreground">
            Past records to help your predictions
          </span>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-muted/60 p-1">
          <button
            onClick={() => setActiveTab('h2h')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'h2h'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Head-to-Head
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'players'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Star Players
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'teams'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Team Form
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-3">
        {activeTab === 'h2h' && (
          <HeadToHeadView
            teamA={currentTeamA}
            teamB={currentTeamB}
            teamAWins={teamAH2HWins}
            teamBWins={teamBH2HWins}
            totalMatches={h2hMatches.length}
            lastFiveResults={lastFiveH2H}
          />
        )}

        {activeTab === 'players' && (
          <PlayersView
            topPerformers={topPerformers}
            teamA={currentTeamA}
            teamB={currentTeamB}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsView
            teamAStats={teamAStats}
            teamBStats={teamBStats}
          />
        )}
      </div>
    </div>
  );
}

function HeadToHeadView({
  teamA,
  teamB,
  teamAWins,
  teamBWins,
  totalMatches,
  lastFiveResults,
}: {
  teamA: Team;
  teamB: Team;
  teamAWins: number;
  teamBWins: number;
  totalMatches: number;
  lastFiveResults: { winner: Team; match: number; date: string }[];
}) {
  if (totalMatches === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          These teams haven&apos;t faced each other yet in this tournament.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Record */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{teamA.name}</p>
          <p className="text-xl font-bold text-blue-600">{teamAWins}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Matches</p>
          <p className="text-lg font-semibold">{totalMatches}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{teamB.name}</p>
          <p className="text-xl font-bold text-purple-600">{teamBWins}</p>
        </div>
      </div>

      {/* Recent Form */}
      {lastFiveResults.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Recent Head-to-Head ({lastFiveResults.length} matches)
          </p>
          <div className="flex gap-1">
            {lastFiveResults.map((result, i) => (
              <div
                key={`${result.match}-${i}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${result.winner.id === teamA.id
                  ? 'bg-blue-500'
                  : 'bg-purple-500'
                  }`}
                title={`Match #${result.match}: ${result.winner.name} won`}
              >
                {result.winner.id === teamA.id ? 'A' : 'B'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayersView({
  topPerformers,
  teamA,
  teamB,
}: {
  topPerformers: PlayerStats[];
  teamA: Team;
  teamB: Team;
}) {
  if (topPerformers.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          No standout performers yet from these teams.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Top Performers This Tournament
      </p>

      {topPerformers.map((stat, i) => (
        <div
          key={stat.player.id}
          className={`flex items-center gap-3 p-2.5 rounded-lg ${stat.player.team_id === teamA.id ? 'bg-blue-50' : 'bg-purple-50'
            }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${stat.player.team_id === teamA.id ? 'bg-blue-500' : 'bg-purple-500'
            }`}>
            #{i + 1}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{stat.player.name}</span>
              <span className="text-xs text-muted-foreground">({stat.player.role})</span>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              {stat.momCount > 0 && <span>⭐ {stat.momCount} MoM</span>}
              {stat.highestScorerCount > 0 && <span>🏏 {stat.highestScorerCount} Top Score</span>}
              {stat.wicketTakerCount > 0 && <span>🎳 {stat.wicketTakerCount} Top Wickets</span>}
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-bold text-primary">{stat.totalAwards}</span>
            <p className="text-xs text-muted-foreground">awards</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamsView({
  teamAStats,
  teamBStats,
}: {
  teamAStats: TeamStats;
  teamBStats: TeamStats;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Tournament Form
      </p>

      <div className="grid grid-cols-2 gap-4">
        <TeamFormCard stats={teamAStats} color="blue" />
        <TeamFormCard stats={teamBStats} color="purple" />
      </div>
    </div>
  );
}

function TeamFormCard({ stats, color }: { stats: TeamStats; color: 'blue' | 'purple' }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
  };

  const progressColor = color === 'blue' ? 'bg-blue-500' : 'bg-purple-500';

  return (
    <div className={`rounded-lg border p-3 ${colorClasses[color]}`}>
      <div className="text-center mb-3">
        <p className="font-semibold text-sm">{stats.team.name}</p>
        <p className="text-xs opacity-75">{stats.wins}/{stats.totalMatches} wins</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span>Win Rate</span>
          <span className="font-semibold">{stats.winPercentage}%</span>
        </div>

        <div className="w-full bg-white/60 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${progressColor}`}
            style={{ width: `${stats.winPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}