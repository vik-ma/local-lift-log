-- This file should undo anything in `up.sql`
ALTER TABLE `sets` DROP COLUMN `is_tracking_user_weight`;
ALTER TABLE `sets` DROP COLUMN `user_weight`;
ALTER TABLE `sets` DROP COLUMN `user_weight_unit`;