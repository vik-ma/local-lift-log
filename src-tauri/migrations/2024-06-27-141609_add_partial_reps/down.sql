-- This file should undo anything in `up.sql`
ALTER TABLE `sets` DROP COLUMN `partial_reps`;
ALTER TABLE `sets` DROP COLUMN `is_tracking_partial_reps`;