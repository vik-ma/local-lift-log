import { IsStringEmpty, ValidLoadExerciseOptionsMap } from "..";
import { ChartDataExerciseCategory } from "../../typings";

export const ValidateDefaultLoadExerciseOptionsString = (str: string) => {
  if (IsStringEmpty(str)) return true;

  const options = str.split(",");

  if (options.length === 0) return false;

  const validLoadExerciseOptionsMap = ValidLoadExerciseOptionsMap();

  for (const option of options) {
    if (!validLoadExerciseOptionsMap.has(option as ChartDataExerciseCategory))
      return false;
  }

  return true;
};
