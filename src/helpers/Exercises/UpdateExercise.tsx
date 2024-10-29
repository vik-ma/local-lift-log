import Database from "tauri-plugin-sql-api";
import { Exercise } from "../../typings";

export const UpdateExercise = async (exercise: Exercise) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE exercises SET name = $1, note = $2, 
       exercise_group_set_string_primary = $3, exercise_group_set_string_secondary = $4, 
       is_favorite = $5, calculation_string = $6 
       WHERE id = $7`,
      [
        exercise.name,
        exercise.note,
        exercise.exercise_group_set_string_primary,
        exercise.exercise_group_set_string_secondary,
        exercise.is_favorite,
        exercise.calculation_string,
        exercise.id,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
