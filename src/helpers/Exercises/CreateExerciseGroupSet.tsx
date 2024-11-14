import { ExerciseGroupDictionary } from "..";

export const CreateExerciseGroupSet = (
  exercise_group_set_string_primary: string
) => {
  const exerciseGroupSet = new Set<string>();

  const exerciseGroupStrings = exercise_group_set_string_primary.split(",");
  const EXERCISE_GROUP_DICTIONARY = ExerciseGroupDictionary();

  for (const exerciseGroup of exerciseGroupStrings) {
    if (EXERCISE_GROUP_DICTIONARY.has(exerciseGroup)) {
      exerciseGroupSet.add(exerciseGroup);
    }
  }

  return exerciseGroupSet;
};
