import { ChartDataExerciseCategoryBase } from "../../typings";
import { IsStringEmpty } from "../Strings/IsStringEmpty";
import { ValidateDefaultLoadExerciseOptionsString } from "./ValidateDefaultLoadExerciseOptionsString";

export const CreateLoadExerciseOptionsList = (str: string) => {
  if (!ValidateDefaultLoadExerciseOptionsString(str)) return [];

  if (IsStringEmpty(str)) return [];

  return str.split(",") as ChartDataExerciseCategoryBase[];
};
