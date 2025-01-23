-- Your SQL goes here
ALTER TABLE `routines` DROP COLUMN `custom_schedule_start_date`;

ALTER TABLE `routines` ADD COLUMN `start_day` INTEGER NOT NULL DEFAULT 0;