-- This file should undo anything in `up.sql`
ALTER TABLE `sets` ADD COLUMN `superset_values` TEXT;
ALTER TABLE `sets` ADD COLUMN `dropset_values` TEXT;
ALTER TABLE `sets` DROP COLUMN `multiset_values`;