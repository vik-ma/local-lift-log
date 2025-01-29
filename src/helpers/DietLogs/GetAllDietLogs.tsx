import Database from "tauri-plugin-sql-api";
import { DietLog } from "../../typings";

export const GetAllDietLogs = async (isAscending: boolean) => {
  const order = isAscending ? "ASC" : "DESC";

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<DietLog[]>(
      `SELECT * FROM diet_logs 
       WHERE date IS NOT NULL AND date LIKE '____-__-__' AND DATE(date) IS NOT NULL 
       ORDER BY date ${order}`
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
