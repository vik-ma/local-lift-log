-- Your SQL goes here
ALTER TABLE `user_settings` RENAME COLUMN `time_input_hhmmss_behavior` TO `time_input_behavior_hhmmss`;
ALTER TABLE `user_settings` RENAME COLUMN `time_input_mmss_behavior` TO `time_input_behavior_mmss`;