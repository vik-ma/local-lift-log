-- This file should undo anything in `up.sql`
ALTER TABLE `workouts` ADD COLUMN `rating` SMALLINT NOT NULL DEFAULT 1;
ALTER TABLE `user_settings` ADD COLUMN `show_workout_rating` SMALLINT NOT NULL DEFAULT 1;