import { ExerciseGroupDictionary } from "..";

export const ValidateExerciseGroupSetStringPrimary = (
  exerciseGroupSetString: string
): boolean => {
  const exerciseGroupStrings = exerciseGroupSetString.split(",");
  const EXERCISE_GROUP_DICTIONARY = ExerciseGroupDictionary();

  for (const exerciseGroup of exerciseGroupStrings) {
    if (!EXERCISE_GROUP_DICTIONARY.has(exerciseGroup)) {
      return false;
    }
  }

  return true;
};
