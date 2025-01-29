import Database from "tauri-plugin-sql-api";
import { DietLog } from "../../typings";

export const GetAllDietLogs = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<DietLog[]>(`SELECT * FROM diet_logs`);

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
