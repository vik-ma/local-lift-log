-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` RENAME COLUMN `load_exercise_options_analytics` TO `default_load_exercise_options`;