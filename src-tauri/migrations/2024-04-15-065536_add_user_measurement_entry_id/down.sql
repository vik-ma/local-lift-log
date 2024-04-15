-- This file should undo anything in `up.sql`
ALTER TABLE `user_measurements` ADD COLUMN `date` TEXT NOT NULL;
ALTER TABLE `user_measurements` ADD COLUMN `comment` TEXT;
ALTER TABLE `user_measurements` DROP COLUMN `user_measurement_entry_id`;