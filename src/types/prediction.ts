export interface Prediction {
  id: string;
  user_id: string;
  player_id: string;
  predicted_price: number;
  predicted_team_id: string;
  created_at: string;
  updated_at: string;
}

export interface Auction {
  id: string;
  player_id: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  sold_price: number | null;
  sold_to_team_id: string | null;
  created_at: string;
}

export interface PlayerWithPrediction {
  id: string;
  name: string;
  role: string;
  base_price: number;
  is_captain: boolean;
  team_id: string | null;
  cricheroes_url: string | null;
  auction: Auction | null;
  prediction: Prediction | null;
}
