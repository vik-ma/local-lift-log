-- Your SQL goes here
ALTER TABLE `user_settings` DROP COLUMN `default_increment_weight`;
ALTER TABLE `user_settings` DROP COLUMN `default_increment_distance`;
ALTER TABLE `user_settings` DROP COLUMN `default_increment_resistance_level`;
ALTER TABLE `user_settings` DROP COLUMN `default_increment_calculation_multiplier`;

ALTER TABLE `user_settings` ADD COLUMN `default_increment_weight` FLOAT NOT NULL DEFAULT 1;
ALTER TABLE `user_settings` ADD COLUMN `default_increment_distance` FLOAT NOT NULL DEFAULT 1;
ALTER TABLE `user_settings` ADD COLUMN `default_increment_resistance_level` FLOAT NOT NULL DEFAULT 1;
ALTER TABLE `user_settings` ADD COLUMN `default_increment_calculation_multiplier` FLOAT NOT NULL DEFAULT 1;