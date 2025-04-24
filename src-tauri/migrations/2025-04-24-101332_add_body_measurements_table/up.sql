-- Your SQL goes here
CREATE TABLE "body_measurements"(
    "id" INTEGER,
    "date" TEXT NOT NULL,
    "comment" TEXT,
    "weight" FLOAT NOT NULL,
    "weight_unit" TEXT NOT NULL,
    "body_fat_percentage" FLOAT,
    "measurement_values" TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);