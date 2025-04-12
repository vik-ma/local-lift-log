-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` ADD COLUMN `load_exercise_options_analytics` TEXT NOT NULL;
ALTER TABLE `user_settings` ADD COLUMN `load_exercise_options_exercise_details` TEXT NOT NULL;
ALTER TABLE `user_settings` ADD COLUMN `load_exercise_options_categories_analytics` TEXT NOT NULL;
ALTER TABLE `user_settings` ADD COLUMN `load_exercise_options_categories_exercise_details` TEXT NOT NULL;