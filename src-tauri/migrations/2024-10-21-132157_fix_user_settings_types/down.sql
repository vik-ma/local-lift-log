-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` DROP COLUMN `default_increment_weight`;
ALTER TABLE `user_settings` DROP COLUMN `default_increment_distance`;
ALTER TABLE `user_settings` DROP COLUMN `default_increment_resistance_level`;
ALTER TABLE `user_settings` DROP COLUMN `default_increment_calculation_multiplier`;

ALTER TABLE `user_settings` ADD COLUMN `default_increment_weight` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `user_settings` ADD COLUMN `default_increment_distance` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `user_settings` ADD COLUMN `default_increment_resistance_level` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `user_settings` ADD COLUMN `default_increment_calculation_multiplier` SMALLINT NOT NULL DEFAULT 1;