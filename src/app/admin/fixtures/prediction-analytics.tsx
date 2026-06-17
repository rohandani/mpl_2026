'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { MatchPrediction } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

interface MatchPredictionWithProfile extends MatchPrediction {
    profiles: { display_name: string | null } | null;
}

interface Props {
    predictions: MatchPredictionWithProfile[];
    teams: Team[];
    players: Player[];
    showCounts: boolean;
}

const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6366F1', // Indigo
];

interface ChartData {
    name: string;
    value: number;
}

export function PredictionAnalytics({ predictions, teams, players, showCounts }: Props) {
    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const playerMap = new Map(players.map((p) => [p.id, p]));

    // Calculate winner predictions
    const winnerCounts = new Map<string, number>();
    predictions.forEach((pred) => {
        if (pred.predicted_winner_id) {
            const count = winnerCounts.get(pred.predicted_winner_id) || 0;
            winnerCounts.set(pred.predicted_winner_id, count + 1);
        }
    });

    // Calculate MOM predictions
    const momCounts = new Map<string, number>();
    predictions.forEach((pred) => {
        if (pred.predicted_mom_id) {
            const count = momCounts.get(pred.predicted_mom_id) || 0;
            momCounts.set(pred.predicted_mom_id, count + 1);
        }
    });

    // Calculate highest scorer predictions
    const scorerCounts = new Map<string, number>();
    predictions.forEach((pred) => {
        if (pred.predicted_highest_scorer_id) {
            const count = scorerCounts.get(pred.predicted_highest_scorer_id) || 0;
            scorerCounts.set(pred.predicted_highest_scorer_id, count + 1);
        }
    });

    // Calculate highest wicket taker predictions
    const bowlerCounts = new Map<string, number>();
    predictions.forEach((pred) => {
        if (pred.predicted_highest_wicket_taker_id) {
            const count = bowlerCounts.get(pred.predicted_highest_wicket_taker_id) || 0;
            bowlerCounts.set(pred.predicted_highest_wicket_taker_id, count + 1);
        }
    });

    // Convert to chart data
    const winnerData: ChartData[] = Array.from(winnerCounts.entries()).map(([teamId, count]) => ({
        name: teamMap.get(teamId)?.name || 'Unknown Team',
        value: count
    }));

    const momData: ChartData[] = Array.from(momCounts.entries())
        .map(([playerId, count]) => ({
            name: playerMap.get(playerId)?.name || 'Unknown Player',
            value: count
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Top 8 to avoid clutter

    const scorerData: ChartData[] = Array.from(scorerCounts.entries())
        .map(([playerId, count]) => ({
            name: playerMap.get(playerId)?.name || 'Unknown Player',
            value: count
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    const bowlerData: ChartData[] = Array.from(bowlerCounts.entries())
        .map(([playerId, count]) => ({
            name: playerMap.get(playerId)?.name || 'Unknown Player',
            value: count
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    const renderCustomTooltip = (data: any) => {
        if (data.active && data.payload && data.payload.length) {
            const payload = data.payload[0];
            return (
                <div className="bg-background border border-border rounded-lg p-3 shadow-xl backdrop-blur-sm">
                    <p className="text-sm font-semibold text-foreground">{payload.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {payload.value} prediction{payload.value !== 1 ? 's' : ''} ({((payload.value / predictions.length) * 100).toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const createLabel = (props: any) => {
        const { name, value, percent } = props;
        const displayName = name || 'Unknown';
        if (showCounts) {
            return `${displayName}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`;
        } else {
            return `${displayName} (${((percent || 0) * 100).toFixed(0)}%)`;
        }
    };

    if (predictions.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No predictions data to analyze.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full min-w-0">
                {/* Winner Predictions */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                        <h3 className="text-base font-semibold text-foreground">Predicted Winners</h3>
                    </div>
                    {winnerData.length > 0 ? (
                        <div className="bg-gradient-to-br from-blue-50/30 to-blue-100/20 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                            <div className="w-full" style={{ height: '320px', minHeight: '320px', minWidth: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart width={400} height={320}>
                                        <defs>
                                            {winnerData.map((_, index) => (
                                                <linearGradient key={`winner-gradient-${index}`} id={`winnerGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                                                    <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <Pie
                                            data={winnerData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={90}
                                            innerRadius={25}
                                            dataKey="value"
                                            stroke="#ffffff"
                                            strokeWidth={2}
                                            label={createLabel}
                                        >
                                            {winnerData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`url(#winnerGradient${index})`}
                                                    className="drop-shadow-md hover:drop-shadow-lg transition-all duration-300"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={renderCustomTooltip} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value, entry) => (
                                                <span className="text-xs font-medium text-foreground">{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-muted/30 rounded-xl p-8 border border-dashed border-muted-foreground/30">
                            <p className="text-sm text-muted-foreground text-center">No winner predictions</p>
                        </div>
                    )}
                </div>

                {/* MOM Predictions */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                        <h3 className="text-base font-semibold text-foreground">Predicted Man of the Match</h3>
                    </div>
                    {momData.length > 0 ? (
                        <div className="bg-gradient-to-br from-emerald-50/30 to-emerald-100/20 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/50">
                            <div className="w-full" style={{ height: '320px', minHeight: '320px', minWidth: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart width={400} height={320}>
                                        <defs>
                                            {momData.map((_, index) => (
                                                <linearGradient key={`mom-gradient-${index}`} id={`momGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                                                    <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <Pie
                                            data={momData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={90}
                                            innerRadius={25}
                                            dataKey="value"
                                            stroke="#ffffff"
                                            strokeWidth={2}
                                            label={createLabel}
                                        >
                                            {momData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`url(#momGradient${index})`}
                                                    className="drop-shadow-md hover:drop-shadow-lg transition-all duration-300"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={renderCustomTooltip} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value, entry) => (
                                                <span className="text-xs font-medium text-foreground">{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-muted/30 rounded-xl p-8 border border-dashed border-muted-foreground/30">
                            <p className="text-sm text-muted-foreground text-center">No MOM predictions</p>
                        </div>
                    )}
                </div>

                {/* Top Scorer Predictions */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600"></div>
                        <h3 className="text-base font-semibold text-foreground">Predicted Highest Scorers</h3>
                    </div>
                    {scorerData.length > 0 ? (
                        <div className="bg-gradient-to-br from-amber-50/30 to-amber-100/20 dark:from-amber-950/30 dark:to-amber-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/50">
                            <div className="w-full" style={{ height: '320px', minHeight: '320px', minWidth: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart width={400} height={320}>
                                        <defs>
                                            {scorerData.map((_, index) => (
                                                <linearGradient key={`scorer-gradient-${index}`} id={`scorerGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                                                    <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <Pie
                                            data={scorerData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={90}
                                            innerRadius={25}
                                            dataKey="value"
                                            stroke="#ffffff"
                                            strokeWidth={2}
                                            label={createLabel}
                                        >
                                            {scorerData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`url(#scorerGradient${index})`}
                                                    className="drop-shadow-md hover:drop-shadow-lg transition-all duration-300"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={renderCustomTooltip} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value, entry) => (
                                                <span className="text-xs font-medium text-foreground">{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-muted/30 rounded-xl p-8 border border-dashed border-muted-foreground/30">
                            <p className="text-sm text-muted-foreground text-center">No top scorer predictions</p>
                        </div>
                    )}
                </div>

                {/* Top Bowler Predictions */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-violet-600"></div>
                        <h3 className="text-base font-semibold text-foreground">Predicted Highest Wicket Takers</h3>
                    </div>
                    {bowlerData.length > 0 ? (
                        <div className="bg-gradient-to-br from-violet-50/30 to-violet-100/20 dark:from-violet-950/30 dark:to-violet-900/20 rounded-xl p-4 border border-violet-200/50 dark:border-violet-800/50">
                            <div className="w-full" style={{ height: '320px', minHeight: '320px', minWidth: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart width={400} height={320}>
                                        <defs>
                                            {bowlerData.map((_, index) => (
                                                <linearGradient key={`bowler-gradient-${index}`} id={`bowlerGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                                                    <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <Pie
                                            data={bowlerData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={90}
                                            innerRadius={25}
                                            dataKey="value"
                                            stroke="#ffffff"
                                            strokeWidth={2}
                                            label={createLabel}
                                        >
                                            {bowlerData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`url(#bowlerGradient${index})`}
                                                    className="drop-shadow-md hover:drop-shadow-lg transition-all duration-300"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={renderCustomTooltip} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value, entry) => (
                                                <span className="text-xs font-medium text-foreground">{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-muted/30 rounded-xl p-8 border border-dashed border-muted-foreground/30">
                            <p className="text-sm text-muted-foreground text-center">No top bowler predictions</p>
                        </div>
                    )}
                </div>
            </div>
    );
}