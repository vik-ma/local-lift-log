import Database from "tauri-plugin-sql-api";
import { WorkoutSet } from "../../typings";

export const UpdateSet = async (set: WorkoutSet): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE sets SET 
        workout_id = $1, exercise_id = $2, is_template = $3, workout_template_id = $4,
        note = $5, comment = $6, is_completed = $7, time_completed = $8, is_warmup = $9, 
        weight = $10, reps = $11, distance = $12, time_in_seconds = $13, rir = $14, rpe = $15, 
        resistance_level = $16, partial_reps = $17, is_tracking_weight = $18, is_tracking_reps = $19, 
        is_tracking_rir = $20, is_tracking_rpe = $21, is_tracking_time = $22, 
        is_tracking_distance = $23, is_tracking_resistance_level = $24, is_tracking_partial_reps = $25, 
        is_tracking_user_weight = $26, weight_unit = $27, distance_unit = $28, multiset_id = $29, 
        user_weight = $30, user_weight_unit = $31
        WHERE id = $32`,
      [
        set.workout_id,
        set.exercise_id,
        set.is_template,
        set.workout_template_id,
        set.note,
        set.comment,
        set.is_completed,
        set.time_completed,
        set.is_warmup,
        set.weight,
        set.reps,
        set.distance,
        set.time_in_seconds,
        set.rir,
        set.rpe,
        set.resistance_level,
        set.partial_reps,
        set.is_tracking_weight,
        set.is_tracking_reps,
        set.is_tracking_rir,
        set.is_tracking_rpe,
        set.is_tracking_time,
        set.is_tracking_distance,
        set.is_tracking_resistance_level,
        set.is_tracking_partial_reps,
        set.is_tracking_user_weight,
        set.weight_unit,
        set.distance_unit,
        set.multiset_id,
        set.user_weight,
        set.user_weight_unit,
        set.id,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
