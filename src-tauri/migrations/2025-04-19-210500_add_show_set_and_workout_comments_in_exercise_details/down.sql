-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` DROP COLUMN `show_set_comments_in_exercise_details`;
ALTER TABLE `user_settings` DROP COLUMN `show_workout_comments_in_exercise_details`;