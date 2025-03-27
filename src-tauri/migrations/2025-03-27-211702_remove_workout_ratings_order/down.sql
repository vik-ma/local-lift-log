-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` ADD COLUMN `workout_ratings_order` TEXT NOT NULL DEFAULT "1,2,3,4,5,6,7,8";