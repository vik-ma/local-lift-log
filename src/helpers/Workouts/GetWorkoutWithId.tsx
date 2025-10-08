import Database from "@tauri-apps/plugin-sql";
import { Workout } from "../../typings";

export const GetWorkoutWithId = async (workoutId: number) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<Workout[]>(
      `SELECT * FROM workouts 
       WHERE id = $1 
        AND date IS NOT NULL 
        AND date LIKE '____-__-__T__:__:__.___Z'
        AND date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'`,
      [workoutId]
    );

    if (result.length === 0) return undefined;

    return result[0];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
