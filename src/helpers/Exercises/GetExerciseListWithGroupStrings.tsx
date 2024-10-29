import Database from "tauri-plugin-sql-api";
import { Exercise } from "../../typings";
import { ConvertExerciseGroupSetStringPrimary } from "..";

export const GetExerciseListWithGroupStrings = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: Exercise[] = await db.select("SELECT * FROM exercises");

    const exercises: Exercise[] = result.map((row) => {
      const convertedValuesPrimary = ConvertExerciseGroupSetStringPrimary(
        row.exercise_group_set_string_primary
      );

      // TODO: ADD SECONDARY

      return {
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
    });

    return exercises;
  } catch (error) {
    console.log(error);
  }
};
