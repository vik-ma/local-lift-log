-- Your SQL goes here
ALTER TABLE `sets` ADD COLUMN `is_superset` SMALLINT NOT NULL;
ALTER TABLE `sets` ADD COLUMN `is_dropset` SMALLINT NOT NULL;
ALTER TABLE `sets` ADD COLUMN `superset_values` TEXT;
ALTER TABLE `sets` ADD COLUMN `dropset_values` TEXT;