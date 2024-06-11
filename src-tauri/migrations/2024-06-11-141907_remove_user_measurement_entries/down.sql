-- This file should undo anything in `up.sql`
CREATE TABLE `user_measurement_entries`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`date` TEXT NOT NULL,
	`comment` TEXT
);

ALTER TABLE `user_measurements` ADD COLUMN `user_measurement_entry_id` INTEGER NOT NULL;
ALTER TABLE `user_measurements` ADD COLUMN `measurement_id` INTEGER NOT NULL;
ALTER TABLE `user_measurements` ADD COLUMN `value` FLOAT NOT NULL;
ALTER TABLE `user_measurements` ADD COLUMN `unit` STRING NOT NULL;

ALTER TABLE `user_measurements` DROP COLUMN `date`;
ALTER TABLE `user_measurements` DROP COLUMN `comment`;
ALTER TABLE `user_measurements` DROP COLUMN `values`;