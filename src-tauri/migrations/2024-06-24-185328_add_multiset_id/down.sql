-- This file should undo anything in `up.sql`
ALTER TABLE `sets` ADD COLUMN `is_superset` SMALLINT NOT NULL;
ALTER TABLE `sets` ADD COLUMN `is_dropset` SMALLINT NOT NULL;
ALTER TABLE `sets` ADD COLUMN `multiset_values` TEXT;

ALTER TABLE `sets` DROP COLUMN `multiset_id`;