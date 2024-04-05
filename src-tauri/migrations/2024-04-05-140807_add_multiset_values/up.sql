-- Your SQL goes here
ALTER TABLE `sets` DROP COLUMN `superset_values`;
ALTER TABLE `sets` DROP COLUMN `dropset_values`;
ALTER TABLE `sets` ADD COLUMN `multiset_values` TEXT;