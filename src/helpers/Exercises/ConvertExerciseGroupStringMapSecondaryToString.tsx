import {
  ConvertNumberToTwoDecimals,
  IsStringValidNumberBetween0And1,
} from "..";
import { ExerciseGroupMap } from "../../typings";

export const ConvertExerciseGroupStringMapSecondaryToString = (
  exerciseGroupStringMap: Map<string, string>,
  multiplierInputMap: Map<string, string>,
  exerciseGroupDictionary: ExerciseGroupMap
): string | null => {
  if (exerciseGroupStringMap.size === 0) return null;

  const exerciseGroupStrings: string[] = [];

  for (const key of exerciseGroupStringMap.keys()) {
    const value = multiplierInputMap.get(key);

    if (
      value === undefined ||
      !exerciseGroupDictionary.has(key) ||
      !IsStringValidNumberBetween0And1(value)
    )
      continue;

    const numValue = ConvertNumberToTwoDecimals(Number(value));

    const exerciseGroupString = `${key}x${numValue}`;

    exerciseGroupStrings.push(exerciseGroupString);
  }

  if (exerciseGroupStrings.length === 0) return null;

  const exerciseGroupString = exerciseGroupStrings.join(",");

  return exerciseGroupString;
};
