import Database from "tauri-plugin-sql-api";
import { UserWeight } from "../../typings";

export const GetAllUserWeights = async (isAscending: boolean) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const order = isAscending ? "ASC" : "DESC";

    // Select all user_weight rows with valid ISO 8601 date strings
    const result = await db.select<UserWeight[]>(
      `SELECT * FROM user_weights
       WHERE date IS NOT NULL 
        AND date LIKE '____-__-__T__:__:__.___Z'
        AND date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'
       ORDER BY date ${order}`
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
