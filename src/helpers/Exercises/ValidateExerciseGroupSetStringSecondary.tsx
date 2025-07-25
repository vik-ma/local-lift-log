import { IsStringInvalidNumber } from "..";
import { ExerciseGroupMap } from "../../typings";

export const ValidateExerciseGroupSetStringSecondary = (
  exerciseGroupSetString: string | null,
  exerciseGroupDictionary: ExerciseGroupMap
) => {
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
      IsStringInvalidNumber(multiplier, 0, false, 1)
    ) {
      return false;
    }
  }

  return true;
};
