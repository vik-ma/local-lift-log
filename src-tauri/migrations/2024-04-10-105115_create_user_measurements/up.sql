-- Your SQL goes here
CREATE TABLE `user_measurements`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`measurement_id` INTEGER NOT NULL,
	`value` FLOAT NOT NULL,
	`unit` STRING NOT NULL,
	`date` STRING NOT NULL
);
