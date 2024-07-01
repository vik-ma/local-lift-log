-- This file should undo anything in `up.sql`
ALTER TABLE `multisets` RENAME COLUMN `set_order` TO `exercise_order`;

ALTER TABLE `multisets` DROP COLUMN `is_template`;