import Database from "tauri-plugin-sql-api";
import { Exercise } from "../../typings";
import {
  ConvertExerciseGroupSetStringPrimary,
  ConvertExerciseGroupSetStringSecondary,
} from "..";

export const GetExerciseListWithGroupStrings = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: Exercise[] = await db.select("SELECT * FROM exercises");

    const exercises: Exercise[] = [];

    result.map((row) => {
      const convertedValuesPrimary = ConvertExerciseGroupSetStringPrimary(
        row.exercise_group_set_string_primary
      );

      const exercise: Exercise = {
        id: row.id,
        name: row.name,
        exercise_group_set_string_primary:
          row.exercise_group_set_string_primary,
        exercise_group_set_string_secondary:
          row.exercise_group_set_string_secondary,
        note: row.note,
        is_favorite: row.is_favorite,
        calculation_string: row.calculation_string,
        exerciseGroupStringListPrimary: convertedValuesPrimary.list,
        formattedGroupStringPrimary: convertedValuesPrimary.formattedString,
      };

      if (row.exercise_group_set_string_secondary !== null) {
        const convertedValuesSecondary = ConvertExerciseGroupSetStringSecondary(
          row.exercise_group_set_string_secondary
        );
        exercise.exerciseGroupStringMapSecondary = convertedValuesSecondary.map;
        exercise.formattedGroupStringSecondary =
          convertedValuesSecondary.formattedString;
      }

      exercises.push(exercise);
    });

    return exercises;
  } catch (error) {
    console.log(error);
  }
};
