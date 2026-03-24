-- ============================================================
-- MPL 2026 — Overall Leaderboard RPC function
-- ============================================================
-- Combines auction prediction points (from existing logic) with
-- match prediction points into a single ranked leaderboard.
-- Runs as SECURITY DEFINER to bypass RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION get_overall_leaderboard()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  auction_points NUMERIC,
  match_points BIGINT,
  total_points NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  WITH auction_scores AS (
    SELECT
      p.user_id,
      ROUND(SUM(
        CASE WHEN p.predicted_team_id = a.sold_to_team_id THEN 20 ELSE 0 END
        +
        GREATEST(0, LEAST(30,
          30.0 - (ABS(p.predicted_price - a.sold_price)::NUMERIC / GREATEST(a.sold_price, 1)) * 100
        ))
      ), 1) AS total_points
    FROM predictions p
    JOIN auctions a ON a.player_id = p.player_id AND a.sold_price IS NOT NULL
    GROUP BY p.user_id
  ),
  match_scores AS (
    SELECT
      mp.user_id,
      SUM(
        CASE WHEN mp.predicted_winner_id = f.winning_team_id
          THEN ms.points_team_win ELSE 0 END
        + CASE WHEN mp.predicted_mom_id = f.mom_player_id
          THEN ms.points_mom ELSE 0 END
        + CASE WHEN mp.predicted_highest_scorer_id = f.highest_scorer_id
          THEN ms.points_highest_scorer ELSE 0 END
        + CASE WHEN mp.predicted_highest_wicket_taker_id = f.highest_wicket_taker_id
          THEN ms.points_highest_wicket_taker ELSE 0 END
      )::BIGINT AS total_points
    FROM match_predictions mp
    JOIN fixtures f ON f.id = mp.fixture_id AND f.status = 'completed'
    CROSS JOIN match_settings ms
    WHERE ms.id = 'default'
    GROUP BY mp.user_id
  ),
  all_users AS (
    SELECT user_id FROM auction_scores
    UNION
    SELECT user_id FROM match_scores
  )
  SELECT
    au.user_id,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.email,
      'Anonymous'
    ) AS display_name,
    COALESCE(a.total_points, 0) AS auction_points,
    COALESCE(m.total_points, 0)::BIGINT AS match_points,
    (COALESCE(a.total_points, 0) + COALESCE(m.total_points, 0)) AS total_points
  FROM all_users au
  JOIN auth.users u ON u.id = au.user_id
  LEFT JOIN auction_scores a ON a.user_id = au.user_id
  LEFT JOIN match_scores m ON m.user_id = au.user_id
  ORDER BY total_points DESC;
$$;
