-- This file should undo anything in `up.sql`
ALTER TABLE `routines` DROP COLUMN `start_day`;

ALTER TABLE `routines` ADD COLUMN `custom_schedule_start_date` TEXT;