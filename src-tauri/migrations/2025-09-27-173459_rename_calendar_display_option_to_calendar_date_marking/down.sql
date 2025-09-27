-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` RENAME COLUMN `calendar_date_marking` TO `calendar_display_option`;