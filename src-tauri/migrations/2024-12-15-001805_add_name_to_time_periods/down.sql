-- This file should undo anything in `up.sql`
ALTER TABLE `time_periods` DROP COLUMN `name`;

ALTER TABLE `time_periods` DROP COLUMN `caloric_intake`;
ALTER TABLE `time_periods` ADD COLUMN `caloric_intake` INTEGER NOT NULL;