-- This file should undo anything in `up.sql`
ALTER TABLE `user_measurements` ADD COLUMN `values` TEXT;
ALTER TABLE `user_measurements` DROP COLUMN `measurement_values`;