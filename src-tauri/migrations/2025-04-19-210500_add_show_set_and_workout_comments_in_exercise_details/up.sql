-- Your SQL goes here
ALTER TABLE `user_settings` ADD COLUMN `show_set_comments_in_exercise_details` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `user_settings` ADD COLUMN `show_workout_comments_in_exercise_details` INTEGER NOT NULL DEFAULT 1;