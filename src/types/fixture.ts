export interface Fixture {
  id: string;
  match_number: number;
  team_a_id: string;
  team_b_id: string;
  match_date: string;
  venue: string | null;
  status: 'upcoming' | 'live' | 'completed';
  winning_team_id: string | null;
  mom_player_id: string | null;
  highest_scorer_id: string | null;
  highest_wicket_taker_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchPrediction {
  id: string;
  user_id: string;
  fixture_id: string;
  predicted_winner_id: string | null;
  predicted_mom_id: string | null;
  predicted_highest_scorer_id: string | null;
  predicted_highest_wicket_taker_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchSettings {
  id: string;
  prediction_deadline_minutes: number;
  points_team_win: number;
  points_mom: number;
  points_highest_scorer: number;
  points_highest_wicket_taker: number;
  updated_at: string;
}
