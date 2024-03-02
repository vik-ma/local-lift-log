-- Your SQL goes here
CREATE TABLE `routines`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`name` TEXT NOT NULL,
	`note` TEXT,
	`is_schedule_weekly` BOOL NOT NULL,
	`num_days_in_schedule` SMALLINT NOT NULL,
	`custom_schedule_start_date` TEXT
);

