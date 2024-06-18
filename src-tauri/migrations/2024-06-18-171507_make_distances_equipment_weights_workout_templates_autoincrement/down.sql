-- This file should undo anything in `up.sql`
DROP TABLE IF EXISTS `distances`;
DROP TABLE IF EXISTS `equipment_weights`;
DROP TABLE IF EXISTS `workout_templates`;

CREATE TABLE `distances`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`name` TEXT NOT NULL,
	`distance` FLOAT NOT NULL,
	`distance_unit` TEXT NOT NULL
);

CREATE TABLE `equipment_weights`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`name` TEXT NOT NULL,
	`weight` FLOAT NOT NULL,
	`weight_unit` TEXT NOT NULL
);

CREATE TABLE `workout_templates`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`name` TEXT NOT NULL,
	`set_list_order` TEXT NOT NULL,
	`note` TEXT
);
