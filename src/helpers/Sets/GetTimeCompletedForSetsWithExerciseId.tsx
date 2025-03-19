import Database from "tauri-plugin-sql-api";
import { TimeCompleted } from "../../typings";

export const GetTimeCompletedForSetsWithExerciseId = async (
  exerciseId: number
): Promise<TimeCompleted[]> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result =
      await db.select<TimeCompleted[]>(
        `SELECT time_completed FROM sets 
         WHERE exercise_id = $1 
          AND is_template = 0
          AND is_completed = 1 
          AND time_completed IS NOT NULL 
          AND time_completed LIKE '____-__-__T__:__:__.___Z'
          AND time_completed GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'
         ORDER BY time_completed ASC`,
        [exerciseId]
      );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
