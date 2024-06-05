import { Routine } from "../../typings";
import Database from "tauri-plugin-sql-api";

export const UpdateRoutine = async (routine: Routine): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      `UPDATE routines SET 
        name = $1, note = $2, is_schedule_weekly = $3, 
        num_days_in_schedule = $4, custom_schedule_start_date = $5 
        WHERE id = $6`,
      [
        routine.name,
        routine.note,
        routine.is_schedule_weekly,
        routine.num_days_in_schedule,
        routine.custom_schedule_start_date,
        routine.id,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
