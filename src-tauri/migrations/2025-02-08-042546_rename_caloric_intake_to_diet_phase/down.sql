-- This file should undo anything in `up.sql`
ALTER TABLE `caloric_intake` RENAME COLUMN `time_periods` TO `diet_phase`;