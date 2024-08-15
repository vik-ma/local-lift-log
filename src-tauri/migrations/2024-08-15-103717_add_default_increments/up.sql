-- Your SQL goes here
ALTER TABLE `user_settings` ADD COLUMN `default_increment_weight` INTEGER NOT NULL;
ALTER TABLE `user_settings` ADD COLUMN `default_increment_distance` INTEGER NOT NULL;
ALTER TABLE `user_settings` ADD COLUMN `default_increment_time` INTEGER NOT NULL;
ALTER TABLE `user_settings` ADD COLUMN `default_increment_resistance_level` INTEGER NOT NULL;