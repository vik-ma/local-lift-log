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
          w.routine_id,
          CASE 
              WHEN w.workout_template_id = 0 THEN 'No Workout Template'
              WHEN t.id IS NULL THEN 'Unknown Workout Template'
              ELSE t.name
          END AS workout_template_name,
          COALESCE(GROUP_CONCAT(DISTINCT e.exercise_group_set_string_primary), '') 
              AS exercise_groups_string
       FROM workouts w
       LEFT JOIN workout_templates t 
          ON w.workout_template_id = t.id
       LEFT JOIN sets s 
          ON w.id = s.workout_id AND s.is_completed = 1
       LEFT JOIN exercises e 
           ON s.exercise_id = e.id
       WHERE w.date LIKE '${yearMonthString}%'
       GROUP BY w.id
       ORDER BY w.date`
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
