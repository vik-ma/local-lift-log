-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` DROP COLUMN `default_increment_weight`;
ALTER TABLE `user_settings` DROP COLUMN `default_increment_distance`;
ALTER TABLE `user_settings` DROP COLUMN `default_increment_time`;
ALTER TABLE `user_settings` DROP COLUMN `default_increment_resistance_level`;