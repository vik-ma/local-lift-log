-- Your SQL goes here

CREATE TABLE `sets`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`workout_id` INTEGER NOT NULL,
	`exercise_id` INTEGER NOT NULL,
	`is_template` BOOL NOT NULL,
	`workout_template_id` INTEGER NOT NULL,
	`note` TEXT,
	`comment` TEXT,
	`is_completed` BOOL NOT NULL,
	`time_completed` TEXT,
	`is_warmup` BOOL NOT NULL,
	`weight` FLOAT NOT NULL,
	`reps` SMALLINT NOT NULL,
	`rir` SMALLINT NOT NULL,
	`time_in_seconds` INTEGER NOT NULL,
	`distance` FLOAT NOT NULL,
	`resistance_level` FLOAT NOT NULL,
	`is_tracking_weight` BOOL NOT NULL,
	`is_tracking_reps` BOOL NOT NULL,
	`is_tracking_rir` BOOL NOT NULL,
	`is_tracking_rpe` BOOL NOT NULL,
	`is_tracking_time` BOOL NOT NULL,
	`is_tracking_distance` BOOL NOT NULL,
	`is_tracking_resistance_level` BOOL NOT NULL
);

