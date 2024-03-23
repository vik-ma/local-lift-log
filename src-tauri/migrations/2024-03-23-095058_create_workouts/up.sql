-- Your SQL goes here
CREATE TABLE `workouts`(
	`id` INTEGER NOT NULL PRIMARY KEY,
	`workout_template_id` INTEGER NOT NULL,
	`date` TEXT NOT NULL,
	`set_list_order` TEXT NOT NULL,
	`note` TEXT
);
