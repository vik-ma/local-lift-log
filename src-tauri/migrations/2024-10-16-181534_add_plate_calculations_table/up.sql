-- Your SQL goes here
CREATE TABLE "plate_calculations"(
	"id" INTEGER,
	"name" TEXT NOT NULL,
	"handle_id" INTEGER NOT NULL,
	"available_plates_string" TEXT NOT NULL,
    "num_handles" SMALLINT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);