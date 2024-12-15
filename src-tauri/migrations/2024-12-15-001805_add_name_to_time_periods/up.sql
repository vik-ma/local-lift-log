-- Your SQL goes here
ALTER TABLE `time_periods` ADD COLUMN `name` TEXT NOT NULL;

ALTER TABLE `time_periods` DROP COLUMN `caloric_intake`;
ALTER TABLE `time_periods` ADD COLUMN `caloric_intake` TEXT;