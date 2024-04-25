import { WorkoutSet } from "../../typings";
import Database from "tauri-plugin-sql-api";
import { OrderSetsBySetListOrderString, InsertSetIntoDatabase } from "..";

type ExerciseOrderQuery = {
  exercise_order: string;
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

    const exerciseOrder = await db.select<ExerciseOrderQuery[]>(
      `SELECT exercise_order FROM workout_templates
        WHERE id = $1`,
      [workout_template_id]
    );

    if (result.length === 0 || exerciseOrder.length === 0) return setList;

    const orderedSetList: WorkoutSet[] = OrderSetsBySetListOrderString(
      result,
      exerciseOrder[0].exercise_order
    );

    for (let i = 0; i < orderedSetList.length; i++) {
      const set: WorkoutSet = orderedSetList[i];
      set.is_template = 0;
      set.workout_id = workout_id;

      const setId: number = await InsertSetIntoDatabase(set);

      if (setId === 0) continue;

      set.id = setId;
      setList.push(set);
    }
  } catch (error) {
    console.log(error);
  }
  return setList;
};
