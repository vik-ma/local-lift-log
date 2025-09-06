import { IsStringInvalidNumber } from "..";
import { ExerciseGroupMap } from "../../typings";

export const ValidateExerciseGroupSetStringSecondary = (
  exerciseGroupSetString: string | null,
  exerciseGroupDictionary: ExerciseGroupMap
) => {
  if (exerciseGroupSetString === null) return true;

  const exerciseGroups = exerciseGroupSetString.split(",");

  const minValue = 0;
  const doNotAllowMinValue = false;
  const maxValue = 1;

  for (const str of exerciseGroups) {
    const exerciseGroupAndMultiplier = str.split("x");

    const exerciseGroup = exerciseGroupAndMultiplier[0];
    const multiplier = exerciseGroupAndMultiplier[1];

    if (
      exerciseGroup === undefined ||
      !exerciseGroupDictionary.has(exerciseGroup) ||
      multiplier === undefined ||
      IsStringInvalidNumber(multiplier, minValue, doNotAllowMinValue, maxValue)
    ) {
      return false;
    }
  }

  return true;
};
