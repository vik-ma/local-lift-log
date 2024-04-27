-- This file should undo anything in `up.sql`
ALTER TABLE `workout_templates` ADD COLUMN `set_list_order` TEXT NOT NULL;
ALTER TABLE `workouts` ADD COLUMN `set_list_order` TEXT NOT NULL;