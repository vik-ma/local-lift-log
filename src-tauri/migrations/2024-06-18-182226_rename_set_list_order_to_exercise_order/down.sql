-- This file should undo anything in `up.sql`
ALTER TABLE `workout_templates` RENAME COLUMN `exercise_order` TO `set_list_order`;