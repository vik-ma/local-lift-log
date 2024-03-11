-- This file should undo anything in `up.sql`

ALTER TABLE `user_settings`
DROP COLUMN `weight_unit`;

ALTER TABLE `user_settings`
DROP COLUMN `distance_unit`;