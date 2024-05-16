import Database from "tauri-plugin-sql-api";
import { WorkoutSet } from "../../typings";

export const UpdateSet = async (
  set: WorkoutSet
): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE sets SET 
        workout_id = $1, exercise_id = $2, is_template = $3, workout_template_id = $4,
        note = $5, is_completed = $6, is_warmup = $7, is_tracking_weight = $8,
        is_tracking_reps = $9, is_tracking_rir = $10, is_tracking_rpe = $11, 
        is_tracking_time = $12, is_tracking_distance = $13, is_tracking_resistance_level = $14,
        weight = $15, reps = $16, distance = $17, time_in_seconds = $18, rir = $19,
        rpe = $20, resistance_level = $21, weight_unit = $22, distance_unit = $23,
        is_superset = $24, is_dropset = $25 
        WHERE id = $26`,
      [
        set.workout_id,
        set.exercise_id,
        set.is_template,
        set.workout_template_id,
        set.note,
        set.is_completed,
        set.is_warmup,
        set.is_tracking_weight,
        set.is_tracking_reps,
        set.is_tracking_rir,
        set.is_tracking_rpe,
        set.is_tracking_time,
        set.is_tracking_distance,
        set.is_tracking_resistance_level,
        set.weight,
        set.reps,
        set.distance,
        set.time_in_seconds,
        set.rir,
        set.rpe,
        set.resistance_level,
        set.weight_unit,
        set.distance_unit,
        set.is_superset,
        set.is_dropset,
        set.id,
      ]
    );
    
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
