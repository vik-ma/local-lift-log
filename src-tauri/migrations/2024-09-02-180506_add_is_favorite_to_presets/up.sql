-- Your SQL goes here
ALTER TABLE `equipment_weights` ADD COLUMN `is_favorite` SMALLINT NOT NULL;
ALTER TABLE `distances` ADD COLUMN `is_favorite` SMALLINT NOT NULL;

ALTER TABLE `workout_routine_schedules` DROP COLUMN `day`;
ALTER TABLE `workout_routine_schedules` ADD COLUMN `day` SMALLINT NOT NULL;