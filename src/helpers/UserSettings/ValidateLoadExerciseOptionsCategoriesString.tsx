import { IsStringEmpty } from "..";
import { VALID_LOAD_EXERCISE_OPTIONS_CATEGORIES } from "../../constants";
import { ChartDataUnitCategoryNoUndefined } from "../../typings";

export const ValidateLoadExerciseOptionsCategoriesString = (str: string) => {
  if (IsStringEmpty(str)) return true;

  const categories = str.split(",");

  if (categories.length > 2) return false;

  for (const category of categories) {
    if (
      !VALID_LOAD_EXERCISE_OPTIONS_CATEGORIES.has(
        category as ChartDataUnitCategoryNoUndefined
      )
    )
      return false;
  }

  if (categories[0] === categories[1]) return false;

  return true;
};
