-- This file should undo anything in `up.sql`
ALTER TABLE `routines` ADD COLUMN `start_day` INTEGER NOT NULL DEFAULT 0;