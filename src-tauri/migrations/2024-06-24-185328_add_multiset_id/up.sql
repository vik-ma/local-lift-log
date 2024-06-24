-- Your SQL goes here
ALTER TABLE `sets` DROP COLUMN `is_superset`;
ALTER TABLE `sets` DROP COLUMN `is_dropset`;
ALTER TABLE `sets` DROP COLUMN `multiset_values`;

ALTER TABLE `sets` ADD COLUMN `multiset_id` INTEGER NOT NULL;