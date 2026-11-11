-- Verwijdert hardcoded rol-achtervoegsels uit de full_name kolom
UPDATE users
SET full_name = TRIM(REPLACE(REPLACE(full_name, '(Planner)', ''), '(Chauffeur)', ''))
WHERE full_name LIKE '%(Planner)%' OR full_name LIKE '%(Chauffeur)%';