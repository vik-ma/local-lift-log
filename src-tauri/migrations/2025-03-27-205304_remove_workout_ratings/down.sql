-- This file should undo anything in `up.sql`
ALTER TABLE `workouts` ADD COLUMN `rating_general` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `workouts` ADD COLUMN `rating_energy` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `workouts` ADD COLUMN `rating_injury` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `workouts` ADD COLUMN `rating_sleep` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `workouts` ADD COLUMN `rating_calories` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `workouts` ADD COLUMN `rating_fasting` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `workouts` ADD COLUMN `rating_time` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `workouts` ADD COLUMN `rating_stress` INTEGER NOT NULL DEFAULT 0;