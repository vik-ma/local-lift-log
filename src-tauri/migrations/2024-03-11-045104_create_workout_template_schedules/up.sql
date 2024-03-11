-- Your SQL goes here

CREATE TABLE `workout_template_schedules`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`day` INTEGER NOT NULL,
	`workout_template_id` INTEGER NOT NULL,
	`routine_id` INTEGER NOT NULL
);

