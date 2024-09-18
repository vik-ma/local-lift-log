import Database from "tauri-plugin-sql-api";
import { Exercise } from "../../typings";

export const UpdateExercise = async (exercise: Exercise) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE exercises SET name = $1, note = $2, 
       exercise_group_set_string = $3, is_favorite = $4, 
       calculation_string = $5 
       WHERE id = $6`,
      [
        exercise.name,
        exercise.note,
        exercise.exercise_group_set_string,
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
