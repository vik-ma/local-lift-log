-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` DROP COLUMN `load_exercise_options_categories_analytics`;
ALTER TABLE `user_settings` DROP COLUMN `load_exercise_options_categories_exercise_details`;