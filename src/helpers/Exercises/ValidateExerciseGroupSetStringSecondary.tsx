import { ExerciseGroupDictionary, IsStringValidNumberBetween0And1 } from "..";

export const ValidateExerciseGroupSetStringSecondary = (
  exerciseGroupSetString: string | null
): boolean => {
  if (exerciseGroupSetString === null) return true;

  const exerciseGroups = exerciseGroupSetString.split(",");
  const EXERCISE_GROUP_DICTIONARY = ExerciseGroupDictionary();

  for (const str of exerciseGroups) {
    const exerciseGroupAndMultiplier = str.split("x");

    const exerciseGroup = exerciseGroupAndMultiplier[0];
    const multiplier = exerciseGroupAndMultiplier[1];

    if (
      exerciseGroup === undefined ||
      !EXERCISE_GROUP_DICTIONARY.has(exerciseGroup) ||
      multiplier === undefined ||
      !IsStringValidNumberBetween0And1(multiplier)
    ) {
      return false;
    }
  }

  return true;
};
