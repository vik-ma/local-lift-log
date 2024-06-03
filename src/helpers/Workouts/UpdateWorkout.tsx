import { Workout } from "../../typings";
import Database from "tauri-plugin-sql-api";

export const UpdateWorkout = async (workout: Workout): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      `UPDATE workouts SET 
        workout_template_id = $1, date = $2, exercise_order = $3, 
        note = $4, is_loaded = $5, rating = $6
        WHERE id = $7`,
      [
        workout.workout_template_id,
        workout.date,
        workout.exercise_order,
        workout.note,
        workout.is_loaded,
        workout.rating,
        workout.id,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
