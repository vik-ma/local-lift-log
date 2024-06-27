-- Your SQL goes here
ALTER TABLE `sets` ADD COLUMN `partial_reps` SMALLINT NOT NULL;
ALTER TABLE `sets` ADD COLUMN `is_tracking_partial_reps` SMALLINT NOT NULL;