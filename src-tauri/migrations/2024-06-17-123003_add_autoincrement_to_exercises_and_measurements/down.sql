-- This file should undo anything in `up.sql`
DROP TABLE IF EXISTS "exercises";
DROP TABLE IF EXISTS "measurements";

CREATE TABLE `exercises`(
    `id` INTEGER NOT NULL PRIMARY KEY,
    `name` TEXT NOT NULL,
    `exercise_group_set_string` TEXT NOT NULL,
    `note` TEXT
);


CREATE TABLE `measurements`(
    `id` INTEGER NOT NULL PRIMARY KEY,
    `name` TEXT NOT NULL,
    `default_unit` TEXT NOT NULL,
    `measurement_type` TEXT NOT NULL
);