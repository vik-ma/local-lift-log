-- Your SQL goes here
ALTER TABLE `routines` RENAME COLUMN `is_schedule_weekly` TO `schedule_type`;

ALTER TABLE `routines` ADD COLUMN `workout_template_order` TEXT;