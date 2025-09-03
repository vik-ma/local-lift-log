import { IsStringEmpty } from "..";
import { LOAD_EXERCISE_OPTIONS_MAP } from "../../constants";
import { ChartDataExerciseCategoryBase } from "../../typings";

export const ValidateLoadExerciseOptionsString = (str: string) => {
  if (IsStringEmpty(str)) return true;

  const options = str.split(",");

  if (options.length === 0) return false;

  for (const option of options) {
    if (!LOAD_EXERCISE_OPTIONS_MAP.has(option as ChartDataExerciseCategoryBase))
      return false;
  }

  return true;
};
