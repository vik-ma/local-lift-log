import Database from "tauri-plugin-sql-api";
import { Exercise, ExerciseGroupMap } from "../../typings";
import {
  ConvertExerciseGroupSetStringPrimary,
  ConvertExerciseGroupSetStringSecondary,
} from "..";

export const GetExerciseWithId = async (
  exerciseId: number,
  exerciseGroupDictionary: ExerciseGroupMap
) => {
  const invalidExercise: Exercise = {
    id: exerciseId,
    name: "Unknown Exercise",
    exercise_group_set_string_primary: "",
    exercise_group_set_string_secondary: null,
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

    const convertedValuesPrimary = ConvertExerciseGroupSetStringPrimary(
      exercise.exercise_group_set_string_primary,
      exerciseGroupDictionary
    );

    exercise.exerciseGroupStringSetPrimary = convertedValuesPrimary.set;
    exercise.formattedGroupStringPrimary =
      convertedValuesPrimary.formattedString;

    if (exercise.exercise_group_set_string_secondary !== null) {
      const convertedValuesSecondary = ConvertExerciseGroupSetStringSecondary(
        exercise.exercise_group_set_string_secondary,
        exerciseGroupDictionary
      );
      exercise.exerciseGroupStringMapSecondary = convertedValuesSecondary.map;
      exercise.formattedGroupStringSecondary =
        convertedValuesSecondary.formattedString;
    }

    return exercise;
  } catch (error) {
    console.log(error);
    return invalidExercise;
  }
};
