-- This file should undo anything in `up.sql`
ALTER TABLE `sets` DROP COLUMN `is_superset`;
ALTER TABLE `sets` DROP COLUMN `is_dropset`;
ALTER TABLE `sets` DROP COLUMN `superset_values`;
ALTER TABLE `sets` DROP COLUMN `dropset_values`;