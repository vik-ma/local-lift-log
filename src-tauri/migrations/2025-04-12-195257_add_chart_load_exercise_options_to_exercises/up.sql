-- Your SQL goes here
ALTER TABLE `exercises` ADD COLUMN `chart_load_exercise_options` TEXT NOT NULL DEFAULT "";
ALTER TABLE `exercises` ADD COLUMN `chart_load_exercise_options_categories` TEXT NOT NULL DEFAULT "";