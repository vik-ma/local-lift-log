-- Your SQL goes here
DROP TABLE IF EXISTS `routines`;
DROP TABLE IF EXISTS `workouts`;
DROP TABLE IF EXISTS `workout_routine_schedules`;

CREATE TABLE "routines"(
	"id" INTEGER,
	"name" TEXT NOT NULL,
	"note" TEXT,
	"is_schedule_weekly" SMALLINT NOT NULL,
	"num_days_in_schedule" SMALLINT NOT NULL,
	"custom_schedule_start_date" TEXT,
    PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "workouts"(
	"id" INTEGER,
	"workout_template_id" INTEGER NOT NULL,
	"date" TEXT NOT NULL,
	"exercise_order" TEXT NOT NULL,
	"note" TEXT,
	"is_loaded" SMALLINT NOT NULL,
	"rating" SMALLINT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "workout_routine_schedules"(
	"id" INTEGER,
	"day" INTEGER NOT NULL,
	"workout_template_id" INTEGER NOT NULL,
	"routine_id" INTEGER NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);