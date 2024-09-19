import Database from "tauri-plugin-sql-api";
import { Exercise } from "../../typings";
import { ConvertExerciseGroupSetString } from "./ConvertExerciseGroupSetString";

export const GetExerciseWithId = async (exerciseId: number) => {
  const invalidExercise: Exercise = {
    id: exerciseId,
    name: "Unknown Exercise",
    exercise_group_set_string: "",
    note: null,
    is_favorite: 0,
    isInvalid: true,
    calculation_string: null,
  };

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: Exercise[] = await db.select(
      "SELECT * FROM exercises WHERE id = $1",
      [exerciseId]
    );

    const exercise = result[0];

    if (!exercise) return invalidExercise;

    const convertedValues = ConvertExerciseGroupSetString(
      exercise.exercise_group_set_string
    );

    exercise.exerciseGroupStringList = convertedValues.list;
    exercise.formattedGroupString = convertedValues.formattedString;

    return exercise;
  } catch (error) {
    console.log(error);
    return invalidExercise;
  }
};
