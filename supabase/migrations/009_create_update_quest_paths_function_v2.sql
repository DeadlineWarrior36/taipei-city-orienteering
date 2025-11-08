-- Drop old function
DROP FUNCTION IF EXISTS update_quest_paths(UUID, JSONB);

-- Create optimized function to only insert new path points
CREATE OR REPLACE FUNCTION update_quest_paths(
  p_quest_id UUID,
  p_paths JSONB
) RETURNS JSONB AS $$
DECLARE
  v_existing_count INTEGER;
  v_new_count INTEGER;
  v_existing_path JSONB;
  v_new_path JSONB;
  v_idx INTEGER;
  v_is_prefix_valid BOOLEAN := true;
  v_epsilon FLOAT := 0.000000001; -- 1e-9
BEGIN
  -- Lock the quest row to prevent concurrent updates
  PERFORM 1 FROM quests WHERE id = p_quest_id FOR UPDATE;

  -- Get count of existing paths
  SELECT COUNT(*)
  INTO v_existing_count
  FROM quest_paths
  WHERE quest_id = p_quest_id;

  -- Get new paths count
  v_new_count := JSONB_ARRAY_LENGTH(p_paths);

  -- If new path is not longer, don't update
  IF v_new_count <= v_existing_count THEN
    RETURN JSONB_BUILD_OBJECT(
      'success', true,
      'updated', false,
      'reason', 'New path is not longer than existing path'
    );
  END IF;

  -- Validate prefix relationship only if there are existing paths
  IF v_existing_count > 0 THEN
    -- Get existing paths for validation
    SELECT JSONB_AGG(
      JSONB_BUILD_OBJECT('lnt', lnt, 'lat', lat)
      ORDER BY sequence_order
    )
    INTO v_existing_path
    FROM quest_paths
    WHERE quest_id = p_quest_id;

    -- Compare each coordinate in the existing prefix
    FOR v_idx IN 0..(v_existing_count - 1) LOOP
      v_new_path := p_paths -> v_idx;

      -- Check if coordinates are approximately equal (within epsilon)
      IF ABS((v_existing_path->v_idx->>'lnt')::FLOAT - (v_new_path->>'lnt')::FLOAT) >= v_epsilon
         OR ABS((v_existing_path->v_idx->>'lat')::FLOAT - (v_new_path->>'lat')::FLOAT) >= v_epsilon THEN
        v_is_prefix_valid := false;
        EXIT;
      END IF;
    END LOOP;

    -- If prefix is invalid, return error
    IF NOT v_is_prefix_valid THEN
      RETURN JSONB_BUILD_OBJECT(
        'success', false,
        'error', 'New path must have a prefix relationship with existing path'
      );
    END IF;
  END IF;

  -- Insert only new path points (from v_existing_count onwards)
  INSERT INTO quest_paths (quest_id, lnt, lat, sequence_order)
  SELECT
    p_quest_id,
    (value->>'lnt')::FLOAT,
    (value->>'lat')::FLOAT,
    idx
  FROM JSONB_ARRAY_ELEMENTS(p_paths) WITH ORDINALITY AS t(value, idx_1)
  CROSS JOIN LATERAL (SELECT idx_1 - 1 AS idx) AS numbered
  WHERE idx >= v_existing_count;

  RETURN JSONB_BUILD_OBJECT(
    'success', true,
    'updated', true
  );
END;
$$ LANGUAGE plpgsql;
