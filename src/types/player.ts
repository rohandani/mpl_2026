export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  base_price: number;
  cricheroes_url: string | null;
  is_captain: boolean;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}
