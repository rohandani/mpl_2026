'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PredictionAnalytics } from '../../prediction-analytics';
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
}

export function AnalyticsWithToggle({ predictions, teams, players }: Props) {
    const [showCounts, setShowCounts] = useState(true);

    return (
        <>
            {/* Toggle Button in Header Area */}
            <div className="flex justify-end mb-6">
                <Button
                    variant={showCounts ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowCounts(!showCounts)}
                    className="text-xs"
                >
                    {showCounts ? "Hide Counts" : "Show Counts"}
                </Button>
            </div>

            {/* Analytics Charts */}
            <PredictionAnalytics
                predictions={predictions}
                teams={teams}
                players={players}
                showCounts={showCounts}
            />
        </>
    );
}