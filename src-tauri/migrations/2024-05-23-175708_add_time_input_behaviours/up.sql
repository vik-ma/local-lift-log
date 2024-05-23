-- Your SQL goes here
ALTER TABLE `user_settings` ADD COLUMN `time_input_hhmmss_behavior` TEXT NOT NULL;
ALTER TABLE `user_settings` ADD COLUMN `time_input_mmss_behavior` TEXT NOT NULL;