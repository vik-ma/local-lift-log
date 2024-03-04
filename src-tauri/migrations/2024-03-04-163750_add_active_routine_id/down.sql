-- This file should undo anything in `up.sql`

ALTER TABLE `user_settings`
DROP COLUMN `active_routine_id`;
