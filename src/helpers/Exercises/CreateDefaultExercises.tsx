import Database from "tauri-plugin-sql-api";
import { DefaultExercises } from "..";

export const CreateDefaultExercises = async () => {
  const DEFAULT_EXERCISES = DefaultExercises();

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    DEFAULT_EXERCISES.forEach((exercise) => {
      db.execute(
        "INSERT into exercises (name, exercise_group_set_string) VALUES ($1, $2)",
        [exercise.name, exercise.exercise_group_set_string]
      );
    });
  } catch (error) {
    console.log(error);
  }
};
