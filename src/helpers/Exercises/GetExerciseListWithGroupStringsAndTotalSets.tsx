import Database from "tauri-plugin-sql-api";
import { Exercise } from "../../typings";
import { ConvertExerciseGroupSetString } from "..";

export const GetExerciseListWithGroupStringsAndTotalSets = async () => {
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
        set_count: row.set_count,
      };
    });

    return exercises;
  } catch (error) {
    console.log(error);
  }
};
