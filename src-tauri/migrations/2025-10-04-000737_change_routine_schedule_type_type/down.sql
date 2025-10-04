-- This file should undo anything in `up.sql`
ALTER TABLE `routines` DROP COLUMN `schedule_type`;
ALTER TABLE `routines` ADD COLUMN `schedule_type` INTEGER NOT NULL DEFAULT 0;