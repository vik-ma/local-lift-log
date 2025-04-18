import Database from "tauri-plugin-sql-api";
import { WorkoutSet } from "../../typings";

export const GetCompletedSetsWithExerciseId = async (exerciseId: number) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<WorkoutSet[]>(
      `SELECT sets.*, 
        (SELECT json_group_object(workouts.id, workouts.comment)
         FROM workouts
         WHERE 
          workouts.id = sets.workout_id
          AND workouts.comment IS NOT NULL
         ) AS workout_comment_json
       FROM 
       sets
        WHERE exercise_id = $1 
         AND is_template = 0
         AND is_completed = 1 
         AND time_completed IS NOT NULL 
         AND time_completed LIKE '____-__-__T__:__:__.___Z'
         AND time_completed GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'
        ORDER BY id ASC`,
      [exerciseId]
    );

    if (result.length === 0)
      return {
        fullSetList: [] as WorkoutSet[],
        workoutCommentMap: new Map() as Map<number, string>,
      };

    const workoutCommentJson = JSON.parse(
      result[0].workout_comment_json ?? "{}"
    );

    const workoutCommentMap: Map<number, string> = new Map(
      Object.entries(workoutCommentJson).map(([key, value]) => [
        Number(key),
        value as string,
      ])
    );

    return { fullSetList: result, workoutCommentMap: workoutCommentMap };
  } catch (error) {
    console.log(error);
    return {
      fullSetList: [] as WorkoutSet[],
      workoutCommentMap: new Map() as Map<number, string>,
    };
  }
};
