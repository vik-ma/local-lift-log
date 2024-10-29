-- This file should undo anything in `up.sql`
ALTER TABLE `exercises` DROP COLUMN `exercise_group_set_string_primary`;
ALTER TABLE `exercises` DROP COLUMN `exercise_group_set_string_secondary`;

ALTER TABLE `exercises` ADD COLUMN `exercise_group_set_string` TEXT NOT NULL;