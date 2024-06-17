-- Your SQL goes here
DROP TABLE IF EXISTS "exercises";
DROP TABLE IF EXISTS "measurements";

CREATE TABLE "exercises"(
    "id" INTEGER,
    "name" TEXT NOT NULL,
    "exercise_group_set_string" TEXT NOT NULL,
    "note" TEXT,
    PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "measurements"(
    "id" INTEGER,
    "name" TEXT NOT NULL,
    "default_unit" TEXT NOT NULL,
    "measurement_type" TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);