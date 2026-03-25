-- ============================================================
-- MPL 2026 — Matches Leaderboard RPC function
-- ============================================================
-- Returns cumulative match prediction points across all
-- completed fixtures per user. Runs as SECURITY DEFINER
-- to bypass RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION get_matches_leaderboard()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  total_points BIGINT,
  matches_predicted BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    mp.user_id,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.email,
      'Anonymous'
    ) AS display_name,
    SUM(
      CASE WHEN mp.predicted_winner_id = f.winning_team_id
        THEN ms.points_team_win ELSE 0 END
      + CASE WHEN mp.predicted_mom_id = f.mom_player_id
        THEN ms.points_mom ELSE 0 END
      + CASE WHEN mp.predicted_highest_scorer_id = f.highest_scorer_id
        THEN ms.points_highest_scorer ELSE 0 END
      + CASE WHEN mp.predicted_highest_wicket_taker_id = f.highest_wicket_taker_id
        THEN ms.points_highest_wicket_taker ELSE 0 END
    )::BIGINT AS total_points,
    COUNT(DISTINCT f.id) AS matches_predicted
  FROM match_predictions mp
  JOIN fixtures f ON f.id = mp.fixture_id AND f.status = 'completed'
  JOIN auth.users u ON u.id = mp.user_id
  CROSS JOIN match_settings ms
  WHERE ms.id = 'default'
  GROUP BY mp.user_id, u.raw_user_meta_data, u.email
  ORDER BY total_points DESC;
$$;
