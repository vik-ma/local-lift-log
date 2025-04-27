import Database from "tauri-plugin-sql-api";
import { GetCurrentDateTimeISOString } from "..";

export const InsertBodyMeasurementsIntoDatabase = async (
  weight: number,
  weightUnit: string,
  bodyFatPercentage: number | null,
  measurementValues: string,
  comment: string | null
) => {
  try {
    const currentDateString = GetCurrentDateTimeISOString();

    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into body_measurements 
       (date, weight, weight_unit, body_fat_percentage, measurement_values, comment) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        currentDateString,
        weight,
        weightUnit,
        bodyFatPercentage,
        measurementValues,
        comment,
      ]
    );
  } catch (error) {
    console.log(error);
  }
};
