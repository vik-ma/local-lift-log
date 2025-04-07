import Database from "tauri-plugin-sql-api";
import {
  ValidateLoadExerciseOptionsCategoriesString,
  ValidateLoadExerciseOptionsString,
} from "..";
import { ChartDataExerciseCategoryBase, ChartDataUnitCategory, UserSettings } from "../../typings";

export const UpdateLoadExerciseOptions = async (
  isAnalytics: boolean,
  loadExerciseOptions: Set<ChartDataExerciseCategoryBase>,
  loadExerciseOptionsUnitCategoryPrimary: ChartDataUnitCategory,
  loadExerciseOptionsUnitCategorySecondary: ChartDataUnitCategory,
  userSettings: UserSettings,
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >
) => {
  const loadExerciseOptionsString = Array.from(loadExerciseOptions).join(",");

  const optionCategories = [loadExerciseOptionsUnitCategoryPrimary];

  if (loadExerciseOptionsUnitCategorySecondary !== undefined) {
    optionCategories.push(loadExerciseOptionsUnitCategorySecondary);
  }

  const loadExerciseOptionsCategoriesString = optionCategories.join(",");

  if (
    !ValidateLoadExerciseOptionsString(loadExerciseOptionsString) ||
    !ValidateLoadExerciseOptionsCategoriesString(
      loadExerciseOptionsCategoriesString
    )
  )
    return;

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
        userSettings.id,
      ]
    );

    const updatedUserSettings: UserSettings = {
      ...userSettings,
      load_exercise_options_analytics: loadExerciseOptionsString,
      load_exercise_options_categories_analytics:
        loadExerciseOptionsCategoriesString,
    };

    setUserSettings(updatedUserSettings);
  } catch (error) {
    console.log(error);
  }
};
