-- Your SQL goes here
ALTER TABLE `exercises` DROP COLUMN `exercise_group_set_string_secondary`;

ALTER TABLE `exercises` ADD COLUMN `exercise_group_set_string_secondary` TEXT;