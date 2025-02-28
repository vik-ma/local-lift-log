import { ChartDataExerciseCategory } from "../../typings";
import { ValidateDefaultLoadExerciseOptionsString } from "./ValidateDefaultLoadExerciseOptionsString";

export const CreateLoadExerciseOptionsList = (str: string) => {
  if (!ValidateDefaultLoadExerciseOptionsString(str)) return [];

  return str.split(",") as ChartDataExerciseCategory[];
};
