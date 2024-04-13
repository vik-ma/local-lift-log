-- This file should undo anything in `up.sql`
ALTER TABLE `user_weights` DROP COLUMN `comment`;
ALTER TABLE `user_measurements` DROP COLUMN `comment`;
