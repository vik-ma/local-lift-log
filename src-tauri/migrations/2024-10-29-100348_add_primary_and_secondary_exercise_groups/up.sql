-- Your SQL goes here
ALTER TABLE `exercises` DROP COLUMN `exercise_group_set_string`;

ALTER TABLE `exercises` ADD COLUMN `exercise_group_set_string_primary` TEXT NOT NULL;
ALTER TABLE `exercises` ADD COLUMN `exercise_group_set_string_secondary` TEXT NOT NULL;