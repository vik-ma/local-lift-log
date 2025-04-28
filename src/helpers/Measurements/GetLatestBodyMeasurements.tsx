import Database from "tauri-plugin-sql-api";
import { BodyMeasurements } from "../../typings";

export const GetLatestBodyMeasurements = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    // Get the body_measurements row with the latest valid ISO 8601 date string value
    const result = await db.select<BodyMeasurements[]>(
      `SELECT *
       FROM body_measurements
       WHERE date IS NOT NULL 
        AND date LIKE '____-__-__T__:__:__.___Z'
        AND date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'
       ORDER BY date DESC
       LIMIT 1`
    );

    return result[0];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
