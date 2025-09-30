-- This file should undo anything in `up.sql`
ALTER TABLE `routines` RENAME COLUMN `no_set_days_workout_template_order` TO `workout_template_order`;