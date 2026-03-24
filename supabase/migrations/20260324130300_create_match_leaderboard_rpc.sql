-- ============================================================
-- MPL 2026 — Match Leaderboard RPC function
-- ============================================================
-- Returns per-user scores for a single fixture by comparing
-- match_predictions against fixture results using match_settings
-- point values. Runs as SECURITY DEFINER to bypass RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION get_match_leaderboard(p_fixture_id UUID)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  team_win_points INTEGER,
  mom_points INTEGER,
  highest_scorer_points INTEGER,
  highest_wicket_taker_points INTEGER,
  total_points INTEGER
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
    CASE WHEN mp.predicted_winner_id = f.winning_team_id
      THEN ms.points_team_win ELSE 0
    END AS team_win_points,
    CASE WHEN mp.predicted_mom_id = f.mom_player_id
      THEN ms.points_mom ELSE 0
    END AS mom_points,
    CASE WHEN mp.predicted_highest_scorer_id = f.highest_scorer_id
      THEN ms.points_highest_scorer ELSE 0
    END AS highest_scorer_points,
    CASE WHEN mp.predicted_highest_wicket_taker_id = f.highest_wicket_taker_id
      THEN ms.points_highest_wicket_taker ELSE 0
    END AS highest_wicket_taker_points,
    (
      CASE WHEN mp.predicted_winner_id = f.winning_team_id
        THEN ms.points_team_win ELSE 0 END
      + CASE WHEN mp.predicted_mom_id = f.mom_player_id
        THEN ms.points_mom ELSE 0 END
      + CASE WHEN mp.predicted_highest_scorer_id = f.highest_scorer_id
        THEN ms.points_highest_scorer ELSE 0 END
      + CASE WHEN mp.predicted_highest_wicket_taker_id = f.highest_wicket_taker_id
        THEN ms.points_highest_wicket_taker ELSE 0 END
    ) AS total_points
  FROM match_predictions mp
  JOIN fixtures f ON f.id = mp.fixture_id
  JOIN auth.users u ON u.id = mp.user_id
  CROSS JOIN match_settings ms
  WHERE mp.fixture_id = p_fixture_id
    AND f.status = 'completed'
    AND ms.id = 'default'
  ORDER BY total_points DESC;
$$;
