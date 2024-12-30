-- Your SQL goes here
CREATE TABLE "diet_logs"(
    "id" INTEGER,
    "date" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "fat" INTEGER,
    "carbs" INTEGER,
    "protein" INTEGER,
    "note" TEXT,
    PRIMARY KEY("id" AUTOINCREMENT)
);