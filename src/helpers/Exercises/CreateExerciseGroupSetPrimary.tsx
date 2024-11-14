import { ExerciseGroupMap } from "../../typings";

export const CreateExerciseGroupSetPrimary = (
  exercise_group_set_string_primary: string,
  exerciseGroupDictionary: ExerciseGroupMap
) => {
  const exerciseGroupSetPrimary = new Set<string>();

  const exerciseGroupStrings = exercise_group_set_string_primary.split(",");

  for (const exerciseGroup of exerciseGroupStrings) {
    if (exerciseGroupDictionary.has(exerciseGroup)) {
      exerciseGroupSetPrimary.add(exerciseGroup);
    }
  }

  return exerciseGroupSetPrimary;
};
