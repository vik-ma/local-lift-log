import { ExerciseGroupDictionary } from "../Constants/ExerciseGroupDictionary";
import { ConvertNumberToTwoDecimals } from "../Numbers/ConvertNumberToTwoDecimals";
import { IsStringValidNumberBetween0And1 } from "../Numbers/IsStringValidNumberBetween0And1";

export const ConvertExerciseGroupStringMapSecondaryToString = (
  exerciseGroupStringMap: Map<string, string>
): string | null => {
  if (exerciseGroupStringMap.size === 0) return null;

  const exerciseGroupDictionary = ExerciseGroupDictionary();

  const exerciseGroupStrings: string[] = [];

  for (const [key, value] of exerciseGroupStringMap) {
    if (
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
