import { ExerciseGroupDictionary } from "..";

export const ValidateExerciseGroupSetString = (
  exerciseGroupSetString: string
): boolean => {
  const exerciseGroupStrings = exerciseGroupSetString.split(",");
  const exerciseGroupDictionary = ExerciseGroupDictionary();

  for (const exerciseGroup of exerciseGroupStrings) {
    if (!exerciseGroupDictionary.has(exerciseGroup)) {
      return false;
    }
  }

  return true;
};
