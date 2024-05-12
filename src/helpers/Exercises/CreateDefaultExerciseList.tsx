import Database from "tauri-plugin-sql-api";
import { DefaultExerciseList } from "..";

export const CreateDefaultExerciseList = async () => {
  const defaultExerciseList = DefaultExerciseList();

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    defaultExerciseList.forEach((exercise) => {
      db.execute(
        "INSERT into exercises (name, exercise_group_set_string) VALUES ($1, $2)",
        [exercise.name, exercise.exercise_group_set_string]
      );
    });
  } catch (error) {
    console.log(error);
  }
};
