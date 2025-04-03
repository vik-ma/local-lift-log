import { ChartDataExerciseCategoryBase } from "../../typings";
import { IsStringEmpty } from "../Strings/IsStringEmpty";
import { ValidateLoadExerciseOptionsString } from "./ValidateLoadExerciseOptionsString";

export const CreateLoadExerciseOptionsList = (str: string) => {
  if (!ValidateLoadExerciseOptionsString(str)) return [];

  if (IsStringEmpty(str)) return [];

  return str.split(",") as ChartDataExerciseCategoryBase[];
};
