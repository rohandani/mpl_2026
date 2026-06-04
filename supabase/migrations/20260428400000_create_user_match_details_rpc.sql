-- ============================================================
-- MPL 2026 — Per-user per-fixture match prediction details
-- ============================================================
-- Returns every user's match predictions with scores broken
-- down by fixture, for use in the leaderboard expandable view.
-- ============================================================

CREATE OR REPLACE FUNCTION get_all_user_match_details()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  fixture_id UUID,
  match_number INTEGER,
  team_a_id TEXT,
  team_b_id TEXT,
  match_date TIMESTAMPTZ,
  winning_team_id TEXT,
  mom_player_id UUID,
  highest_scorer_id UUID,
  highest_wicket_taker_id UUID,
  predicted_winner_id TEXT,
  predicted_mom_id UUID,
  predicted_highest_scorer_id UUID,
  predicted_highest_wicket_taker_id UUID,
  team_win_points INTEGER,
  mom_points INTEGER,
  highest_scorer_points INTEGER,
  highest_wicket_taker_points INTEGER,
  total_points INTEGER
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $fn$
  SELECT
    mp.user_id,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.email,
      'Anonymous'
    ) AS display_name,
    f.id AS fixture_id,
    f.match_number,
    f.team_a_id,
    f.team_b_id,
    f.match_date,
    f.winning_team_id,
    f.mom_player_id,
    f.highest_scorer_id,
    f.highest_wicket_taker_id,
    mp.predicted_winner_id,
    mp.predicted_mom_id,
    mp.predicted_highest_scorer_id,
    mp.predicted_highest_wicket_taker_id,
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
  JOIN fixtures f ON f.id = mp.fixture_id AND f.status = 'completed'
  JOIN auth.users u ON u.id = mp.user_id
  CROSS JOIN match_settings ms
  WHERE ms.id = 'default'
  ORDER BY f.match_number ASC, total_points DESC;
$fn$;
