-- This file should undo anything in `up.sql`
ALTER TABLE `multisets` DROP COLUMN `multiset_type`;
ALTER TABLE `multisets` ADD COLUMN `multiset_type` INTEGER NOT NULL DEFAULT 0;