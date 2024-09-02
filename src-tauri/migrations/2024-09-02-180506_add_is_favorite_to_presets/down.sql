-- This file should undo anything in `up.sql`
ALTER TABLE `equipment_weights` DROP COLUMN `is_favorite`;
ALTER TABLE `distances` DROP COLUMN `is_favorite`;

ALTER TABLE `workout_routine_schedules` DROP COLUMN `day`;
ALTER TABLE `workout_routine_schedules` ADD COLUMN `day` INTEGER NOT NULL;