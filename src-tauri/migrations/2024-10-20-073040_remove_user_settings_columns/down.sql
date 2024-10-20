-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` ADD COLUMN `default_equipment_weight_id` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `user_settings` ADD COLUMN `default_num_handles` SMALLINT NOT NULL DEFAULT 1;