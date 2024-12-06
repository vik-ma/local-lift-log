-- This file should undo anything in `up.sql`
ALTER TABLE `plate_collections` RENAME TO `plate_calculations`;

ALTER TABLE `user_settings` RENAME COLUMN `default_plate_collection_id` TO `default_plate_calculation_id`;