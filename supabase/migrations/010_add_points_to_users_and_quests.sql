-- Add total_points to users table
ALTER TABLE users ADD COLUMN total_points INTEGER NOT NULL DEFAULT 0;

-- Add points to quests table
ALTER TABLE quests ADD COLUMN points INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points DESC);
