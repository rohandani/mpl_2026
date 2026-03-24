export interface ShareConfig {
  id: string;
  title: string;
  hashtags: string[];
  updated_at: string;
}

/** These are always included regardless of config */
export const PERMANENT_HASHTAGS = ['#MPL2026', '#PredictAndWin'];
