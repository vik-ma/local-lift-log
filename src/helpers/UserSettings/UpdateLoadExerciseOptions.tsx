import Database from "tauri-plugin-sql-api";
import {
  ValidateLoadExerciseOptionsCategoriesString,
  ValidateLoadExerciseOptionsString,
} from "..";
import {
  ChartDataExerciseCategoryBase,
  ChartDataUnitCategory,
} from "../../typings";

export const UpdateLoadExerciseOptions = async (
  loadExerciseOptions: Set<ChartDataExerciseCategoryBase>,
  loadExerciseOptionsUnitCategoryPrimary: ChartDataUnitCategory,
  loadExerciseOptionsUnitCategorySecondary: ChartDataUnitCategory,
  exerciseId: number
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
    return { success: false, loadExerciseOptionsString: "" };

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE exercises SET 
        chart_load_exercise_options = $1,
        chart_load_exercise_options_categories = $2 
       WHERE id = $3`,
      [
        loadExerciseOptionsString,
        loadExerciseOptionsCategoriesString,
        exerciseId,
      ]
    );
    return {
      success: true,
      loadExerciseOptionsString: loadExerciseOptionsString,
    };
  } catch (error) {
    console.log(error);
    return { success: false, loadExerciseOptionsString: "" };
  }
};
