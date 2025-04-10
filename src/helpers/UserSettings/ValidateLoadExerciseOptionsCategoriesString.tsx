import { IsStringEmpty, ValidLoadExerciseOptionsCategories } from "..";
import { ChartDataUnitCategoryNoUndefined } from "../../typings";

export const ValidateLoadExerciseOptionsCategoriesString = (str: string) => {
  if (IsStringEmpty(str)) return true;

  const categories = str.split(",");

  if (categories.length > 2) return false;

  const validLoadExerciseOptionsCategories =
    ValidLoadExerciseOptionsCategories();

  for (const category of categories) {
    if (
      !validLoadExerciseOptionsCategories.has(
        category as ChartDataUnitCategoryNoUndefined
      )
    )
      return false;
  }

  if (categories[0] === categories[1]) return false;

  return true;
};
