-- This file should undo anything in `up.sql`
ALTER TABLE `user_settings` ADD COLUMN `num_pagination_items_modal_desktop` INTEGER NOT NULL DEFAULT 40;