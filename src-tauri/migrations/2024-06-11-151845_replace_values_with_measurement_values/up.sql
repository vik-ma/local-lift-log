-- Your SQL goes here
ALTER TABLE `user_measurements` DROP COLUMN `values`;
ALTER TABLE `user_measurements` ADD COLUMN `measurement_values` TEXT NOT NULL;