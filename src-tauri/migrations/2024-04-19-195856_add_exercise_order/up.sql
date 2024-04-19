-- Your SQL goes here
ALTER TABLE `workout_templates` ADD COLUMN `exercise_order` TEXT NOT NULL;
ALTER TABLE `workouts` ADD COLUMN `exercise_order` TEXT NOT NULL;