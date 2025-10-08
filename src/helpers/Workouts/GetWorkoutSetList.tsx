import Database from "@tauri-apps/plugin-sql";
import { WorkoutSet } from "../../typings";

export const GetWorkoutSetList = async (
  workoutId: number,
  getOnlyCompletedSets?: boolean
): Promise<WorkoutSet[]> => {
  try {
    const isCompletedConditional = getOnlyCompletedSets
      ? "AND is_completed = 1"
      : "";

    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<WorkoutSet[]>(
      `SELECT sets.*, 
      COALESCE(exercises.name, 'Unknown Exercise') AS exercise_name
      FROM sets LEFT JOIN 
      exercises ON sets.exercise_id = exercises.id 
      WHERE workout_id = $1 AND is_template = 0 ${isCompletedConditional}`,
      [workoutId]
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
