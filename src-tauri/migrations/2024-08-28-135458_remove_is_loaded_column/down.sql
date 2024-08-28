-- This file should undo anything in `up.sql`
ALTER TABLE `workouts` ADD COLUMN `is_loaded` INTEGER NOT NULL;