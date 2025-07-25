import { ExerciseGroupMap } from "../../typings";

export const ValidateExerciseGroupSetStringPrimary = (
  exerciseGroupSetString: string,
  exerciseGroupDictionary: ExerciseGroupMap
) => {
  const exerciseGroupStrings = exerciseGroupSetString.split(",");

  for (const exerciseGroup of exerciseGroupStrings) {
    if (!exerciseGroupDictionary.has(exerciseGroup)) {
      return false;
    }
  }

  return true;
};
