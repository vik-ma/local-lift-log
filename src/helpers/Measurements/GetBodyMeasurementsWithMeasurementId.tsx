import Database from "tauri-plugin-sql-api";

type BodyMeasurementsMeasurements = {
  id: number;
  measurement_values: string;
  date: string;
  comment: string | null;
};

export const GetBodyMeasurementsWithMeasurementId = async (
  measurementId: number
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: BodyMeasurementsMeasurements[] = await db.select(
      `SELECT id, date, comment, measurement_values FROM body_measurements 
       WHERE 
        date IS NOT NULL 
        AND date LIKE '____-__-__T__:__:__.___Z'
        AND date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'
        AND json_valid(measurement_values) = 1 
        AND json_type(measurement_values, '$.${measurementId}') IS NOT NULL
       ORDER BY date`
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
