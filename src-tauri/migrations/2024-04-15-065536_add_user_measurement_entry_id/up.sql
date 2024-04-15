-- Your SQL goes here
ALTER TABLE `user_measurements` DROP COLUMN `date`;
ALTER TABLE `user_measurements` DROP COLUMN `comment`;
ALTER TABLE `user_measurements` ADD COLUMN `user_measurement_entry_id` INTEGER NOT NULL;