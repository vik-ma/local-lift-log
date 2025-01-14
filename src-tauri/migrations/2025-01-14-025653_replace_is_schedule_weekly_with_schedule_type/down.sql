-- This file should undo anything in `up.sql`
ALTER TABLE `routines` RENAME COLUMN `schedule_type` TO `is_schedule_weekly`;

ALTER TABLE `routines` DROP COLUMN `workout_template_order`;