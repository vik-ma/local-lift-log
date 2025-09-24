import Database from "@tauri-apps/plugin-sql";
import { CalendarWorkoutItem } from "../../typings";

export const GetCalendarWorkoutList = async (yearMonthString: string) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<CalendarWorkoutItem[]>(
      `SELECT 
        w.id,
        w.date,
        w.workout_template_id,
        CASE 
          WHEN w.workout_template_id = 0 THEN 'No Workout Template'
          WHEN t.id IS NULL THEN 'Unknown Workout Template'
          ELSE t.name
        END AS workout_template_name
       FROM workouts w
       LEFT JOIN workout_templates t 
        ON w.workout_template_id = t.id
       WHERE date LIKE '${yearMonthString}%';`
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
