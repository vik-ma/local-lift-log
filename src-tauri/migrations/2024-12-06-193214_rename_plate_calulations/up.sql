-- Your SQL goes here
ALTER TABLE `plate_calculations` RENAME TO `plate_collections`;

ALTER TABLE `user_settings` RENAME COLUMN `default_plate_calculation_id` TO `default_plate_collection_id`;