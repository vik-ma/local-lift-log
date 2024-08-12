-- Your SQL goes here
ALTER TABLE `sets` DROP COLUMN `weight_unit`;
ALTER TABLE `sets` DROP COLUMN `distance_unit`;
ALTER TABLE `sets` DROP COLUMN `user_weight_unit`;

ALTER TABLE `sets` ADD COLUMN `weight_unit` TEXT NOT NULL;
ALTER TABLE `sets` ADD COLUMN `distance_unit` TEXT NOT NULL;
ALTER TABLE `sets` ADD COLUMN `user_weight_unit` TEXT NOT NULL;