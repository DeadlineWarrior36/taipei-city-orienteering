INSERT INTO points_transactions (user_id, quest_id, transaction_type, points, description, created_at)
SELECT
  q.user_id,
  q.id,
  'earned',
  q.points,
  CONCAT('完成任務「', m.name, '」獲得點數'),
  q.updated_at
FROM quests q
JOIN missions m ON q.mission_id = m.id
WHERE q.points > 0
  AND q.is_finished = TRUE
  AND NOT EXISTS (
    SELECT 1
    FROM points_transactions pt
    WHERE pt.quest_id = q.id
  );
