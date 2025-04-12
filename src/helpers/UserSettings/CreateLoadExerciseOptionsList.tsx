import { ChartDataExerciseCategoryBase } from "../../typings";
import { IsStringEmpty } from "../Strings/IsStringEmpty";
import { ValidateLoadExerciseOptionsString } from "./ValidateLoadExerciseOptionsString";

export const CreateLoadExerciseOptionsList = (
  loadExerciseOptionsString: string,
  exercise_group_set_string_primary: string
) => {
  if (!ValidateLoadExerciseOptionsString(loadExerciseOptionsString)) return [];

  if (IsStringEmpty(loadExerciseOptionsString)) {
    // Default options for empty strings
    if (exercise_group_set_string_primary === "16") {
      // If Exercise is Cardio
      return ["distance_max", "time_max"] as ChartDataExerciseCategoryBase[];
    }

    return ["weight_max", "num_reps_max"] as ChartDataExerciseCategoryBase[];
  }

  return loadExerciseOptionsString.split(
    ","
  ) as ChartDataExerciseCategoryBase[];
};
