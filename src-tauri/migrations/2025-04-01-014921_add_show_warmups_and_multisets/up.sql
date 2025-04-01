-- Your SQL goes here
ALTER TABLE `user_settings` ADD COLUMN `show_warmups_in_exercise_details` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `user_settings` ADD COLUMN `show_multisets_in_exercise_details` INTEGER NOT NULL DEFAULT 1;