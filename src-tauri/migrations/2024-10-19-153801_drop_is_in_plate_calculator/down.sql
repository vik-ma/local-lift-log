-- This file should undo anything in `up.sql`
ALTER TABLE `equipment_weights` ADD `is_in_plate_calculator` SMALLINT NOT NULL DEFAULT 0;