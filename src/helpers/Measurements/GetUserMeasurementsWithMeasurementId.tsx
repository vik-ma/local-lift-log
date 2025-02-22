import Database from "tauri-plugin-sql-api";
import { UserMeasurement } from "../../typings";

export const GetUserMeasurementsWithMeasurementId = async (
  measurementId: number
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: UserMeasurement[] = await db.select(
      `SELECT * FROM user_measurements 
       WHERE 
        date IS NOT NULL 
        AND date LIKE '____-__-__T__:__:__.___Z'
        AND date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'
        AND json_valid(measurement_values) = 1 
        AND json_type(measurement_values, '$.${measurementId}') IS NOT NULL
       ORDER BY date ASC`
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
