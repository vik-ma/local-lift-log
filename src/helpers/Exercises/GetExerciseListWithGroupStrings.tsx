import Database from "tauri-plugin-sql-api";
import { Exercise } from "../../typings";
import { ConvertExerciseGroupSetString } from "..";

export const GetExerciseListWithGroupStrings = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: Exercise[] = await db.select("SELECT * FROM exercises");

    const exercises: Exercise[] = result.map((row) => {
      const convertedValues = ConvertExerciseGroupSetString(
        row.exercise_group_set_string
      );
      return {
        id: row.id,
        name: row.name,
        exercise_group_set_string: row.exercise_group_set_string,
        note: row.note,
        exerciseGroupStringList: convertedValues.list,
        formattedGroupString: convertedValues.formattedString,
      };
    });

    return exercises;
  } catch (error) {
    console.log(error);
  }
};
