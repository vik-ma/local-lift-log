import Database from "tauri-plugin-sql-api";
import { WorkoutSet } from "../../typings";

export const GetWorkoutSetList = async (
  workoutId: number
): Promise<WorkoutSet[]> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<WorkoutSet[]>(
      `SELECT sets.*, 
      COALESCE(exercises.name, 'Unknown Exercise') AS exercise_name
      FROM sets LEFT JOIN 
      exercises ON sets.exercise_id = exercises.id 
      WHERE workout_id = $1 AND is_template = 0`,
      [workoutId]
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
