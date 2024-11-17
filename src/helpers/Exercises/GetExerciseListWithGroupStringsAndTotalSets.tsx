import Database from "tauri-plugin-sql-api";
import { Exercise, ExerciseGroupMap } from "../../typings";
import {
  ConvertExerciseGroupSetStringPrimary,
  ConvertExerciseGroupSetStringSecondary,
} from "..";

export const GetExerciseListWithGroupStringsAndTotalSets = async (
  exerciseGroupDictionary: ExerciseGroupMap
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: Exercise[] = await db.select(`
      SELECT e.*, COALESCE(s.set_count, 0) AS set_count 
      FROM exercises e 
      LEFT JOIN (
      SELECT exercise_id, COUNT(*) AS set_count
      FROM sets
      WHERE is_completed = 1
      GROUP BY exercise_id
      ) s ON e.id = s.exercise_id;`);

    const exercises: Exercise[] = [];

    result.map((row) => {
      const convertedValuesPrimary = ConvertExerciseGroupSetStringPrimary(
        row.exercise_group_set_string_primary,
        exerciseGroupDictionary
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
        set_count: row.set_count,
      };

      if (row.exercise_group_set_string_secondary !== null) {
        const convertedValuesSecondary = ConvertExerciseGroupSetStringSecondary(
          row.exercise_group_set_string_secondary,
          exerciseGroupDictionary
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
