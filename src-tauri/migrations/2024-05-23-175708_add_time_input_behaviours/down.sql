-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` DROP COLUMN `time_input_hhmmss_behavior`;
ALTER TABLE `user_settings` DROP COLUMN `time_input_mmss_behavior`;