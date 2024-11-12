import Database from "tauri-plugin-sql-api";
import { Routine } from "../../typings";

export const GetAllRoutinesWithNumWorkoutTemplates = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    // Get all columns and number of workout_routine_schedule entries for every Routine
    const result = await db.select<Routine[]>(
      `SELECT routines.*, 
       COUNT(workout_routine_schedules.routine_id) AS numWorkoutTemplates 
       FROM routines LEFT JOIN workout_routine_schedules
       ON routines.id = workout_routine_schedules.routine_id 
       GROUP BY routines.id`
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
