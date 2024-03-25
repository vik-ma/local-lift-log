import { WorkoutSet } from "../../typings";
import Database from "tauri-plugin-sql-api";
import { OrderSetsBySetListOrderString } from "..";

type SetListOrderQuery = {
  set_list_order: string;
};

export const CreateSetsFromWorkoutTemplate = async (
  workout_id: number,
  workout_template_id: number
) => {
  const setList: WorkoutSet[] = [];
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<WorkoutSet[]>(
      `SELECT sets.*, exercises.name AS exercise_name
      FROM sets 
      JOIN exercises ON sets.exercise_id = exercises.id 
      WHERE workout_template_id = $1 AND is_template = 1`,
      [workout_template_id]
    );

    const setListOrder = await db.select<SetListOrderQuery[]>(
      `SELECT set_list_order FROM workout_templates
        WHERE id = $1`,
      [workout_template_id]
    );

    if (result.length === 0 || setListOrder.length === 0) return setList;

    const orderedSetList: WorkoutSet[] = OrderSetsBySetListOrderString(
      result,
      setListOrder[0].set_list_order
    );

    for (let i = 0; i < orderedSetList.length; i++) {
      const set: WorkoutSet = orderedSetList[i];
      set.is_template = 0;
      set.workout_id = workout_id;

      const result = await db.execute(
        `INSERT into sets
            (workout_id, exercise_id, is_template, workout_template_id, note, is_completed, is_warmup,
              weight, reps, rir, rpe, time_in_seconds, distance, resistance_level, is_tracking_weight,
              is_tracking_reps, is_tracking_rir, is_tracking_rpe, is_tracking_time, is_tracking_distance,
              is_tracking_resistance_level, weight_unit, distance_unit)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
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
        ]
      );

      set.id = result.lastInsertId;
      setList.push(set);
    }
  } catch (error) {
    console.log(error);
  }
  return setList;
};
