-- This file should undo anything in `up.sql`
ALTER TABLE `workout_templates` DROP COLUMN `exercise_order`;
ALTER TABLE `workouts` DROP COLUMN `exercise_order`;