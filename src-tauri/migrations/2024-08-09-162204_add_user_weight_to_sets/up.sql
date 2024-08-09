-- Your SQL goes here
ALTER TABLE `sets` ADD COLUMN `is_tracking_user_weight` SMALLINT NOT NULL;
ALTER TABLE `sets` ADD COLUMN `user_weight` FLOAT NOT NULL;
ALTER TABLE `sets` ADD COLUMN `user_weight_unit` TEXT;