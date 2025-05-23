import { ConvertNumberToTwoDecimals, IsStringInvalidNumber } from "..";
import { ExerciseGroupMap } from "../../typings";

export const ConvertExerciseGroupStringMapSecondaryToString = (
  exerciseGroupStringMap: Map<string, string>,
  multiplierInputMap: Map<string, string>,
  exerciseGroupDictionary: ExerciseGroupMap
) => {
  if (exerciseGroupStringMap.size === 0) return null;

  const exerciseGroupStrings: string[] = [];

  for (const key of exerciseGroupStringMap.keys()) {
    const value = multiplierInputMap.get(key);

    if (
      value === undefined ||
      !exerciseGroupDictionary.has(key) ||
      IsStringInvalidNumber(value, 0, false, 1)
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
