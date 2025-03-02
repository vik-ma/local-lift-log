import Database from "tauri-plugin-sql-api";
import { WorkoutSet } from "../../typings";

export const GetCompletedSetsWithExerciseId = async (exerciseId: number) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<WorkoutSet[]>(
      "SELECT * FROM sets WHERE exercise_id = $1 AND is_completed = 1",
      [exerciseId]
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
