-- This file should undo anything in `up.sql`
ALTER TABLE `diet_logs` RENAME COLUMN `comment` TO `note`;