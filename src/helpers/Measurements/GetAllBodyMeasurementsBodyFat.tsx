import Database from "tauri-plugin-sql-api";

type BodyMeasurementsBodyFat = {
  id: number;
  body_fat_percentage: number;
  date: string;
  comment: string | null;
};

export const GetAllBodyMeasurementsBodyFat = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    // Select all rows with valid ISO 8601 date strings and body_fat_percentage is not null
    const result = await db.select<BodyMeasurementsBodyFat[]>(
      `SELECT id, body_fat_percentage, date, comment FROM body_measurements
       WHERE body_fat_percentage IS NOT NULL
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
