import { Workout } from "../../typings";
import Database from "tauri-plugin-sql-api";

export const UpdateWorkout = async (workout: Workout): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      `UPDATE workouts SET 
        workout_template_id = $1, date = $2, 
        exercise_order = $3, note = $4, 
        rating_general = $5, rating_energy = $6, 
        rating_injury = $7, rating_sleep = $8, 
        rating_calories = $9, rating_fasting = $10, 
        rating_time = $11, rating_stress = $12,
        routine_id = $13 
        WHERE id = $14`,
      [
        workout.workout_template_id,
        workout.date,
        workout.exercise_order,
        workout.note,
        workout.rating_general,
        workout.rating_energy,
        workout.rating_injury,
        workout.rating_sleep,
        workout.rating_calories,
        workout.rating_fasting,
        workout.rating_time,
        workout.rating_stress,
        workout.routine_id,
        workout.id,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
