-- This file should undo anything in `up.sql`
DROP TABLE IF EXISTS `sets`;

CREATE TABLE `sets`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`workout_id` INTEGER NOT NULL,
	`exercise_id` INTEGER NOT NULL,
	`is_template` SMALLINT NOT NULL,
	`workout_template_id` INTEGER NOT NULL,
	`note` TEXT,
	`comment` TEXT,
	`is_completed` SMALLINT NOT NULL,
	`time_completed` TEXT,
	`is_warmup` SMALLINT NOT NULL,
	`weight` FLOAT NOT NULL,
	`reps` SMALLINT NOT NULL,
	`rir` SMALLINT NOT NULL,
	`rpe` SMALLINT NOT NULL,
	`time_in_seconds` INTEGER NOT NULL,
	`distance` FLOAT NOT NULL,
	`resistance_level` FLOAT NOT NULL,
	`partial_reps` SMALLINT NOT NULL,
	`is_tracking_weight` SMALLINT NOT NULL,
	`is_tracking_reps` SMALLINT NOT NULL,
	`is_tracking_rir` SMALLINT NOT NULL,
	`is_tracking_rpe` SMALLINT NOT NULL,
	`is_tracking_time` SMALLINT NOT NULL,
	`is_tracking_distance` SMALLINT NOT NULL,
	`is_tracking_resistance_level` SMALLINT NOT NULL,
	`is_tracking_partial_reps` SMALLINT NOT NULL,
	`weight_unit` TEXT,
	`distance_unit` TEXT,
	`multiset_id` INTEGER NOT NULL
);