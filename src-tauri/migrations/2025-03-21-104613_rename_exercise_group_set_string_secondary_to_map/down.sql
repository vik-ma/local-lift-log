-- This file should undo anything in `up.sql`
ALTER TABLE `exercises` RENAME COLUMN `exercise_group_map_string_secondary` TO `exercise_group_set_string_secondary`;