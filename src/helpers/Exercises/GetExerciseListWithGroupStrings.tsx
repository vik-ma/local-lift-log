import Database from "@tauri-apps/plugin-sql";
import { Exercise, ExerciseGroupMap } from "../../typings";
import {
  ConvertExerciseGroupSetStringPrimary,
  LoadExerciseGroupSetStringSecondary,
} from "..";

export const GetExerciseListWithGroupStrings = async (
  exerciseGroupDictionary: ExerciseGroupMap
): Promise<{
  exercises: Exercise[];
  newExerciseMap: Map<number, Exercise>;
}> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: Exercise[] = await db.select("SELECT * FROM exercises");

    const exercises: Exercise[] = [];
    const newExerciseMap = new Map<number, Exercise>();

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
        exercise_group_map_string_secondary:
          row.exercise_group_map_string_secondary,
        note: row.note,
        is_favorite: row.is_favorite,
        calculation_string: row.calculation_string,
        chart_load_exercise_options: row.chart_load_exercise_options,
        chart_load_exercise_options_categories:
          row.chart_load_exercise_options_categories,
        exerciseGroupStringSetPrimary: convertedValuesPrimary.set,
        formattedGroupStringPrimary: convertedValuesPrimary.formattedString,
      };

      LoadExerciseGroupSetStringSecondary(
        exercise,
        exerciseGroupDictionary,
        convertedValuesPrimary.set
      );

      exercises.push(exercise);
      newExerciseMap.set(exercise.id, exercise);
    });

    return { exercises, newExerciseMap };
  } catch (error) {
    console.log(error);
    return { exercises: [], newExerciseMap: new Map() };
  }
};
