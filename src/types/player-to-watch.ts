export type HighlightType = 'form' | 'record' | 'key_player' | 'injury_return' | 'captaincy' | 'new_replacement' | 'buzzing_player' | 'milestone_chase' | 'underdog' | 'veteran_experience' | 'young_talent' | 'power_hitter' | 'death_bowler';

export interface PlayerToWatch {
  id: string;
  fixture_id: string;
  player_id: string;
  highlight_type: HighlightType;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const HIGHLIGHT_TYPE_LABELS: Record<HighlightType, string> = {
  form: '🔥 In Form',
  record: '📊 Track Record',
  key_player: '⭐ Key Player',
  injury_return: '🏥 Return from Injury',
  captaincy: '👑 Captain',
  new_replacement: '🆕 New Replacement',
  buzzing_player: '⚡ Buzzing Player',
  milestone_chase: '🎯 Milestone Chase',
  underdog: '🐺 Dark Horse',
  veteran_experience: '🎖️ Veteran',
  young_talent: '🌟 Rising Star',
  power_hitter: '💥 Power Hitter',
  death_bowler: '🎳 Death Bowler'
};

export const HIGHLIGHT_TYPE_COLORS: Record<HighlightType, string> = {
  form: 'bg-orange-100 text-orange-800 border-orange-200',
  record: 'bg-blue-100 text-blue-800 border-blue-200',
  key_player: 'bg-purple-100 text-purple-800 border-purple-200',
  injury_return: 'bg-green-100 text-green-800 border-green-200',
  captaincy: 'bg-amber-100 text-amber-800 border-amber-200',
  new_replacement: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  buzzing_player: 'bg-pink-100 text-pink-800 border-pink-200',
  milestone_chase: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  underdog: 'bg-gray-100 text-gray-800 border-gray-200',
  veteran_experience: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  young_talent: 'bg-lime-100 text-lime-800 border-lime-200',
  power_hitter: 'bg-red-100 text-red-800 border-red-200',
  death_bowler: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200'
};