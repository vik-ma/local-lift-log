import { IsStringEmpty, ValidLoadExerciseOptionsMap } from "..";
import { ChartDataExerciseCategoryBase } from "../../typings";

export const ValidateLoadExerciseOptionsString = (str: string) => {
  if (IsStringEmpty(str)) return true;

  const options = str.split(",");

  if (options.length === 0) return false;

  const validLoadExerciseOptionsMap = ValidLoadExerciseOptionsMap();

  for (const option of options) {
    if (
      !validLoadExerciseOptionsMap.has(option as ChartDataExerciseCategoryBase)
    )
      return false;
  }

  return true;
};
