import { IsStringValidNumberBetween0And1 } from "..";
import { ExerciseGroupMap } from "../../typings";

export const ValidateExerciseGroupSetStringSecondary = (
  exerciseGroupSetString: string | null,
  exerciseGroupDictionary: ExerciseGroupMap
): boolean => {
  if (exerciseGroupSetString === null) return true;

  const exerciseGroups = exerciseGroupSetString.split(",");

  for (const str of exerciseGroups) {
    const exerciseGroupAndMultiplier = str.split("x");

    const exerciseGroup = exerciseGroupAndMultiplier[0];
    const multiplier = exerciseGroupAndMultiplier[1];

    if (
      exerciseGroup === undefined ||
      !exerciseGroupDictionary.has(exerciseGroup) ||
      multiplier === undefined ||
      !IsStringValidNumberBetween0And1(multiplier)
    ) {
      return false;
    }
  }

  return true;
};
