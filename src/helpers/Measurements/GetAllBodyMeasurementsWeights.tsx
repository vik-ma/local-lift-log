import Database from "tauri-plugin-sql-api";

type BodyMeasurementsWeight = {
  weight: number;
  weight_unit: string;
  date: string;
  comment: string | null;
};

export const GetAllBodyMeasurementsWeights = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    // Select all rows with valid ISO 8601 date strings and weight is above 0
    const result = await db.select<BodyMeasurementsWeight[]>(
      `SELECT weight, weight_unit, date, comment FROM body_measurements
       WHERE weight > 0
        AND date IS NOT NULL 
        AND date LIKE '____-__-__T__:__:__.___Z'
        AND date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'
       ORDER BY date`
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
