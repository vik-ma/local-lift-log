import Database from "@tauri-apps/plugin-sql";
import { Routine } from "../../typings";

export const GetActiveRoutine = async (activeRoutineId: number) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<Routine[]>(
      `SELECT 
        routines.*,
        json_group_array(
          CASE 
            WHEN workout_routine_schedules.workout_template_id IS NULL 
            THEN NULL
            ELSE json_object(
              'workout_template_id', workout_routine_schedules.workout_template_id,
              'day', workout_routine_schedules.day,
              'name', workout_templates.name
            )
          END
        ) AS routineSchedules
       FROM routines
       LEFT JOIN workout_routine_schedules 
         ON routines.id = workout_routine_schedules.routine_id
       LEFT JOIN workout_templates
         ON workout_routine_schedules.workout_template_id = workout_templates.id
       WHERE routines.id = $1`,
      [activeRoutineId]
    );

    if (result.length === 0) return undefined;

    const activeRoutine = result[0];

    return activeRoutine;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
