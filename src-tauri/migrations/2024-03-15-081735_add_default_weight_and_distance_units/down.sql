-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` DROP COLUMN `default_unit_weight`;
ALTER TABLE `user_settings` DROP COLUMN `default_unit_distance`;
