import Database from "tauri-plugin-sql-api";
import {
  ValidateLoadExerciseOptionsCategoriesString,
  ValidateLoadExerciseOptionsString,
} from "..";

export const UpdateLoadExerciseOptions = async (
  loadExerciseOptionsString: string,
  loadExerciseOptionsCategoriesString: string,
  userSettingsId: number,
  isAnalytics: boolean
) => {
  if (
    !ValidateLoadExerciseOptionsString(loadExerciseOptionsString) ||
    !ValidateLoadExerciseOptionsCategoriesString(
      loadExerciseOptionsCategoriesString
    )
  )
    return false;

  const optionsColumn = isAnalytics
    ? "load_exercise_options_analytics"
    : "load_exercise_options_exercise_details";

  const categoriesColumn = isAnalytics
    ? "load_exercise_options_categories_analytics"
    : "load_exercise_options_categories_exercise_details";

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE user_settings SET ${optionsColumn} = $1, ${categoriesColumn} = $2 WHERE id = $3`,
      [
        loadExerciseOptionsString,
        loadExerciseOptionsCategoriesString,
        userSettingsId,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
