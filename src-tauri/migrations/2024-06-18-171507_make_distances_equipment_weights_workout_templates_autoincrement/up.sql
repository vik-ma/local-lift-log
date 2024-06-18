-- Your SQL goes here
DROP TABLE IF EXISTS "distances";
DROP TABLE IF EXISTS "equipment_weights";
DROP TABLE IF EXISTS "workout_templates";

CREATE TABLE "distances"(
	"id" INTEGER,
	"name" TEXT NOT NULL,
	"distance" FLOAT NOT NULL,
	"distance_unit" TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "equipment_weights"(
	"id" INTEGER,
	"name" TEXT NOT NULL,
	"weight" FLOAT NOT NULL,
	"weight_unit" TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "workout_templates"(
	"id" INTEGER,
	"name" TEXT NOT NULL,
	"set_list_order" TEXT NOT NULL,
	"note" TEXT,
    PRIMARY KEY("id" AUTOINCREMENT)
);
