import Database from "@tauri-apps/plugin-sql";
import { CalendarWorkoutItem } from "../../typings";
import {
  ConvertDateToYearMonthString,
  GetNextMonthDate,
  GetTimezoneOffsetString,
} from "..";

export const GetCalendarWorkoutList = async (
  date: Date,
  yearMonthString: string
) => {
  try {
    const nextMonthDate = GetNextMonthDate(date);

    const nextYearMonthString = ConvertDateToYearMonthString(nextMonthDate);

    const timezoneOffset = GetTimezoneOffsetString();

    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<CalendarWorkoutItem[]>(
      `SELECT 
        w.id,
        w.date,
        w.workout_template_id,
        w.routine_id,
        CASE 
          WHEN w.workout_template_id = 0 THEN 'No Workout Template'
          WHEN t.id IS NULL THEN 'Unknown'
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
       WHERE datetime(w.date, '${timezoneOffset}') >= datetime('${yearMonthString}-01T00:00:00')
          AND datetime(w.date, '${timezoneOffset}') < datetime('${nextYearMonthString}-01T00:00:00')
          AND datetime(w.date, '${timezoneOffset}') <= datetime('now', '${timezoneOffset}')
       GROUP BY w.id
       ORDER BY w.date`
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
