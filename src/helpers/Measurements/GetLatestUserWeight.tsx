import Database from "tauri-plugin-sql-api";
import { FormatDateTimeString } from "..";
import { UserWeight } from "../../typings";


export const GetLatestUserWeight = async (clockStyle: string) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    // Get the body_measurements row with the latest valid ISO 8601 date string value and weight
    const result = await db.select<UserWeight[]>(
      `SELECT weight, weight_unit, date 
       FROM body_measurements
       WHERE weight > 0 
        AND date IS NOT NULL 
        AND date LIKE '____-__-__T__:__:__.___Z'
        AND date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'
       ORDER BY date DESC
       LIMIT 1`
    );

    const userWeight = result[0];

    if (userWeight === undefined) return undefined;

    userWeight.formattedDate = FormatDateTimeString(
      userWeight.date,
      clockStyle === "24h"
    );

    return userWeight;
  } catch (error) {
    console.log(error);
  }
};
