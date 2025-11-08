-- Create function to atomically update quest paths with prefix validation
CREATE OR REPLACE FUNCTION update_quest_paths(
  p_quest_id UUID,
  p_paths JSONB
) RETURNS JSONB AS $$
DECLARE
  v_existing_paths JSONB;
  v_new_path JSONB;
  v_existing_path JSONB;
  v_idx INTEGER;
  v_min_length INTEGER;
  v_is_prefix_related BOOLEAN := true;
  v_epsilon FLOAT := 0.000000001; -- 1e-9
BEGIN
  -- Lock the quest row to prevent concurrent updates
  PERFORM 1 FROM quests WHERE id = p_quest_id FOR UPDATE;

  -- Get existing paths as JSONB array
  SELECT JSONB_AGG(
    JSONB_BUILD_OBJECT('lnt', lnt, 'lat', lat)
    ORDER BY sequence_order
  )
  INTO v_existing_paths
  FROM quest_paths
  WHERE quest_id = p_quest_id;

  -- If no existing paths, allow any new paths
  IF v_existing_paths IS NULL THEN
    v_existing_paths := '[]'::JSONB;
  END IF;

  -- Check prefix relationship if there are existing paths
  IF JSONB_ARRAY_LENGTH(v_existing_paths) > 0 THEN
    v_min_length := LEAST(
      JSONB_ARRAY_LENGTH(v_existing_paths),
      JSONB_ARRAY_LENGTH(p_paths)
    );

    -- Compare each coordinate in the prefix
    FOR v_idx IN 0..(v_min_length - 1) LOOP
      v_existing_path := v_existing_paths -> v_idx;
      v_new_path := p_paths -> v_idx;

      -- Check if coordinates are approximately equal (within epsilon)
      IF ABS((v_existing_path->>'lnt')::FLOAT - (v_new_path->>'lnt')::FLOAT) >= v_epsilon
         OR ABS((v_existing_path->>'lat')::FLOAT - (v_new_path->>'lat')::FLOAT) >= v_epsilon THEN
        v_is_prefix_related := false;
        EXIT;
      END IF;
    END LOOP;

    -- If not prefix related, return error
    IF NOT v_is_prefix_related THEN
      RETURN JSONB_BUILD_OBJECT(
        'success', false,
        'error', 'New path must have a prefix relationship with existing path'
      );
    END IF;

    -- If new path is not longer, don't update
    IF JSONB_ARRAY_LENGTH(p_paths) <= JSONB_ARRAY_LENGTH(v_existing_paths) THEN
      RETURN JSONB_BUILD_OBJECT(
        'success', true,
        'updated', false,
        'reason', 'New path is not longer than existing path'
      );
    END IF;
  END IF;

  -- Delete existing paths
  DELETE FROM quest_paths WHERE quest_id = p_quest_id;

  -- Insert new paths
  INSERT INTO quest_paths (quest_id, lnt, lat, sequence_order)
  SELECT
    p_quest_id,
    (value->>'lnt')::FLOAT,
    (value->>'lat')::FLOAT,
    idx
  FROM JSONB_ARRAY_ELEMENTS(p_paths) WITH ORDINALITY AS t(value, idx_1)
  CROSS JOIN LATERAL (SELECT idx_1 - 1 AS idx) AS numbered;

  RETURN JSONB_BUILD_OBJECT(
    'success', true,
    'updated', true
  );
END;
$$ LANGUAGE plpgsql;
