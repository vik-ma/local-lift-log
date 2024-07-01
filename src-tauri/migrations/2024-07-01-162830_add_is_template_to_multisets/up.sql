-- Your SQL goes here
ALTER TABLE `multisets` RENAME COLUMN `exercise_order` TO `set_order`;

ALTER TABLE `multisets` ADD COLUMN `is_template` SMALLINT NOT NULL;