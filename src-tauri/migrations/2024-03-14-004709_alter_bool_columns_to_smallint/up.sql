-- Your SQL goes here
ALTER TABLE `routines` DROP COLUMN `is_schedule_weekly`;
ALTER TABLE `routines` ADD COLUMN `is_schedule_weekly` SMALLINT NOT NULL;

ALTER TABLE `user_settings` DROP COLUMN `show_timestamp_on_completed_set`;
ALTER TABLE `user_settings` ADD COLUMN `show_timestamp_on_completed_set` SMALLINT NOT NULL;

ALTER TABLE `sets` DROP COLUMN `is_template`;
ALTER TABLE `sets` ADD COLUMN `is_template` SMALLINT NOT NULL;

ALTER TABLE `sets` DROP COLUMN `is_completed`;
ALTER TABLE `sets` ADD COLUMN `is_completed` SMALLINT NOT NULL;

ALTER TABLE `sets` DROP COLUMN `is_warmup`;
ALTER TABLE `sets` ADD COLUMN `is_warmup` SMALLINT NOT NULL;

ALTER TABLE `sets` DROP COLUMN `is_tracking_weight`;
ALTER TABLE `sets` ADD COLUMN `is_tracking_weight` SMALLINT NOT NULL;

ALTER TABLE `sets` DROP COLUMN `is_tracking_reps`;
ALTER TABLE `sets` ADD COLUMN `is_tracking_reps` SMALLINT NOT NULL;

ALTER TABLE `sets` DROP COLUMN `is_tracking_rir`;
ALTER TABLE `sets` ADD COLUMN `is_tracking_rir` SMALLINT NOT NULL;

ALTER TABLE `sets` DROP COLUMN `is_tracking_rpe`;
ALTER TABLE `sets` ADD COLUMN `is_tracking_rpe` SMALLINT NOT NULL;

ALTER TABLE `sets` DROP COLUMN `is_tracking_time`;
ALTER TABLE `sets` ADD COLUMN `is_tracking_time` SMALLINT NOT NULL;

ALTER TABLE `sets` DROP COLUMN `is_tracking_distance`;
ALTER TABLE `sets` ADD COLUMN `is_tracking_distance` SMALLINT NOT NULL;

ALTER TABLE `sets` DROP COLUMN `is_tracking_resistance_level`;
ALTER TABLE `sets` ADD COLUMN `is_tracking_resistance_level` SMALLINT NOT NULL;
