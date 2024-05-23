-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` RENAME COLUMN `time_input_behavior_hhmmss` TO `time_input_hhmmss_behavior`;
ALTER TABLE `user_settings` RENAME COLUMN `time_input_behavior_mmss` TO `time_input_mmss_behavior`;