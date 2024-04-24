import Database from "tauri-plugin-sql-api";
import { WorkoutSet } from "../../typings";

export const InsertSetIntoDatabase = async (
  set: WorkoutSet
): Promise<number> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into sets 
        (workout_id, exercise_id, is_template, workout_template_id, note, is_completed, is_warmup, 
          weight, reps, rir, rpe, time_in_seconds, distance, resistance_level, is_tracking_weight,
          is_tracking_reps, is_tracking_rir, is_tracking_rpe, is_tracking_time, is_tracking_distance,
          is_tracking_resistance_level, weight_unit, distance_unit, is_superset, is_dropset) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
          $21, $22, $23, $24, $25)`,
      [
        set.workout_id,
        set.exercise_id,
        set.is_template,
        set.workout_template_id,
        set.note,
        set.is_completed,
        set.is_warmup,
        set.weight,
        set.reps,
        set.rir,
        set.rpe,
        set.time_in_seconds,
        set.distance,
        set.resistance_level,
        set.is_tracking_weight,
        set.is_tracking_reps,
        set.is_tracking_rir,
        set.is_tracking_rpe,
        set.is_tracking_time,
        set.is_tracking_distance,
        set.is_tracking_resistance_level,
        set.weight_unit,
        set.distance_unit,
        set.is_superset,
        set.is_dropset,
      ]
    );
    return result.lastInsertId;
  } catch (error) {
    console.log(error);
    return 0;
  }
};
