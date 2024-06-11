-- Your SQL goes here
DROP TABLE IF EXISTS `user_measurement_entries`;

ALTER TABLE `user_measurements` DROP COLUMN `user_measurement_entry_id`; 
ALTER TABLE `user_measurements` DROP COLUMN `measurement_id`;
ALTER TABLE `user_measurements` DROP COLUMN `value`;
ALTER TABLE `user_measurements` DROP COLUMN `unit`;

ALTER TABLE `user_measurements` ADD COLUMN `date` TEXT NOT NULL;
ALTER TABLE `user_measurements` ADD COLUMN `comment` TEXT;
ALTER TABLE `user_measurements` ADD COLUMN `values` TEXT;