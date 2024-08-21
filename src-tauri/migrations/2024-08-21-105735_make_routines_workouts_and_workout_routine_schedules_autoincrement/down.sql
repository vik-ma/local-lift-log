-- This file should undo anything in `up.sql`
DROP TABLE IF EXISTS `routines`;
DROP TABLE IF EXISTS `workouts`;
DROP TABLE IF EXISTS `workout_routine_schedules`;

CREATE TABLE `routines`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`name` TEXT NOT NULL,
	`note` TEXT,
	`is_schedule_weekly` SMALLINT NOT NULL,
	`num_days_in_schedule` SMALLINT NOT NULL,
	`custom_schedule_start_date` TEXT
);

CREATE TABLE `workouts`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`workout_template_id` INTEGER NOT NULL,
	`date` TEXT NOT NULL,
	`exercise_order` TEXT NOT NULL,
	`note` TEXT,
	`is_loaded` SMALLINT NOT NULL,
	`rating` SMALLINT NOT NULL
);

CREATE TABLE `workout_routine_schedules`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`day` INTEGER NOT NULL,
	`workout_template_id` INTEGER NOT NULL,
	`routine_id` INTEGER NOT NULL
);
