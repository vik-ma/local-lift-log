-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` DROP COLUMN `show_warmups_in_exercise_details`;
ALTER TABLE `user_settings` DROP COLUMN `show_multisets_in_exercise_details`;