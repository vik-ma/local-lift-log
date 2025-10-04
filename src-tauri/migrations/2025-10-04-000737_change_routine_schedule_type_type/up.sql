-- Your SQL goes here
ALTER TABLE `routines` DROP COLUMN `schedule_type`;
ALTER TABLE `routines` ADD COLUMN `schedule_type` TEXT NOT NULL DEFAULT "Weekly";