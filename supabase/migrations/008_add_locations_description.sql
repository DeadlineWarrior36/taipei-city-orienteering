ALTER TABLE locations ADD COLUMN description TEXT;

UPDATE locations l
SET description = a.introduction
FROM attractions a
WHERE l.id = a.location_id AND a.introduction IS NOT NULL;
