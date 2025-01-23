import { Routine } from "../../typings";
import Database from "tauri-plugin-sql-api";

export const UpdateRoutine = async (routine: Routine): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      `UPDATE routines SET 
        name = $1, note = $2, schedule_type = $3, 
        num_days_in_schedule = $4, start_day = $5, 
        workout_template_order = $6 
       WHERE id = $7`,
      [
        routine.name,
        routine.note,
        routine.schedule_type,
        routine.num_days_in_schedule,
        routine.start_day,
        routine.workout_template_order,
        routine.id,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
