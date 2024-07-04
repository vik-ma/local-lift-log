import { WorkoutSet } from "../../typings";
import Database from "tauri-plugin-sql-api";

type ExerciseName = {
  name: string;
};

export const GetSetFromId = async (
  id: number
): Promise<WorkoutSet | undefined> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<WorkoutSet[]>(
      `SELECT * FROM sets WHERE id = $1`,
      [id]
    );

    if (result.length === 0) return undefined;

    const set = result[0];

    const exerciseName = await db.select<ExerciseName[]>(
      `SELECT name FROM exercises WHERE id = $1`,
      [set.exercise_id]
    );

    if (exerciseName.length === 0) {
      set.hasInvalidExerciseId = true;
      set.exercise_name = "Unknown";
    } else {
      set.exercise_name = exerciseName[0].name;
    }

    return set;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
