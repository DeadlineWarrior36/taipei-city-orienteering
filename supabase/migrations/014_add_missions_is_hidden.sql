-- Add is_hidden column to missions table
ALTER TABLE missions
ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for filtering hidden missions
CREATE INDEX idx_missions_is_hidden ON missions(is_hidden);
