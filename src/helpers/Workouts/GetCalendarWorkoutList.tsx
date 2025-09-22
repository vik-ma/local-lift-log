import Database from "@tauri-apps/plugin-sql";
import { CalendarWorkoutItem } from "../../typings";

export const GetCalendarWorkoutList = async (yearMonthString: string) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<CalendarWorkoutItem[]>(
      `SELECT id, date FROM workouts WHERE date LIKE '${yearMonthString}%';`
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
