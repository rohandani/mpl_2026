export type HighlightType = 'form' | 'record' | 'key_player' | 'injury_return' | 'captaincy';

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
  captaincy: '👑 Captain'
};

export const HIGHLIGHT_TYPE_COLORS: Record<HighlightType, string> = {
  form: 'bg-orange-100 text-orange-800 border-orange-200',
  record: 'bg-blue-100 text-blue-800 border-blue-200',
  key_player: 'bg-purple-100 text-purple-800 border-purple-200',
  injury_return: 'bg-green-100 text-green-800 border-green-200',
  captaincy: 'bg-amber-100 text-amber-800 border-amber-200'
};