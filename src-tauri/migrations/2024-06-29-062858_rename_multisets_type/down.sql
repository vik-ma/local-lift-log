-- This file should undo anything in `up.sql`
ALTER TABLE `multisets` RENAME COLUMN `multiset_type` TO `type`;