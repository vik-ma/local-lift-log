-- This file should undo anything in `up.sql`
ALTER TABLE `exercises` DROP COLUMN `chart_load_exercise_options`;
ALTER TABLE `exercises` DROP COLUMN `chart_load_exercise_options_categories`;