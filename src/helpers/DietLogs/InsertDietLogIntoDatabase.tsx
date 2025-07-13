import Database from "@tauri-apps/plugin-sql";
import { DietLog } from "../../typings";

export const InsertDietLogIntoDatabase = async (dietLog: DietLog) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into diet_logs 
        (date, calories, fat, carbs, protein, comment) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        dietLog.date,
        dietLog.calories,
        dietLog.fat,
        dietLog.carbs,
        dietLog.protein,
        dietLog.comment,
      ]
    );

    if (result.lastInsertId === undefined) return 0;

    return result.lastInsertId;
  } catch (error) {
    console.log(error);
    return 0;
  }
};
