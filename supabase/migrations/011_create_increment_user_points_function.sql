-- Function to increment user's total points
CREATE OR REPLACE FUNCTION increment_user_points(
  p_user_id TEXT,
  p_points INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET total_points = total_points + p_points
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
