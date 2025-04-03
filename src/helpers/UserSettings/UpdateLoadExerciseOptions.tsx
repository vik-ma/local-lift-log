import Database from "tauri-plugin-sql-api";
import { ValidateDefaultLoadExerciseOptionsString } from "..";

export const UpdateLoadExerciseOptions = async (
  loadExerciseOptionsString: string,
  userSettingsId: number,
  isAnalytics: boolean
) => {
  if (
    !ValidateDefaultLoadExerciseOptionsString(loadExerciseOptionsString)
  )
    return false;

  const column = isAnalytics
    ? "load_exercise_options_analytics"
    : "load_exercise_options_exercise_details";

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(`UPDATE user_settings SET ${column} = $1 WHERE id = $2`, [
      loadExerciseOptionsString,
      userSettingsId,
    ]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
