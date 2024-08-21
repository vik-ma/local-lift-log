import { WorkoutSet } from "../../typings";
import Database from "tauri-plugin-sql-api";

export const GetSetsOfLastCompletedExercise = async (
  exerciseId: number,
  currentWorkoutId: number
): Promise<WorkoutSet[]> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<WorkoutSet[]>(
      `SELECT *
      FROM sets
      WHERE exercise_id = $1
      AND workout_id = (
      SELECT MAX(workout_id) 
      FROM sets 
      WHERE exercise_id = $1
      AND workout_id != $2
      )
      AND is_completed = 1;`,
      [exerciseId, currentWorkoutId]
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
