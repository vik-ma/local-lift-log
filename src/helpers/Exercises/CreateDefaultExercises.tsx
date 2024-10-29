import Database from "tauri-plugin-sql-api";
import { DefaultExercises } from "..";

export const CreateDefaultExercises = async () => {
  const DEFAULT_EXERCISES = DefaultExercises();

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    DEFAULT_EXERCISES.forEach((exercise) => {
      db.execute(
        `INSERT into exercises 
         (name, exercise_group_set_string_primary, 
         exercise_group_set_string_secondary, is_favorite) 
         VALUES ($1, $2, $3, $4)`,
        [
          exercise.name,
          exercise.exercise_group_set_string_primary,
          exercise.exercise_group_set_string_secondary,
          0,
        ]
      );
    });
  } catch (error) {
    console.log(error);
  }
};
