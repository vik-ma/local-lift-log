-- This file should undo anything in `up.sql`
ALTER TABLE `workouts` RENAME COLUMN `comment` TO `note`;