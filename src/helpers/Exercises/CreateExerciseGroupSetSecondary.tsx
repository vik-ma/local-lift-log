import { IsStringInvalidNumber } from "..";
import { ExerciseGroupMap } from "../../typings";

export const CreateExerciseGroupSetSecondary = (
  exercise_group_map_string_secondary: string,
  exerciseGroupDictionary: ExerciseGroupMap
) => {
  const exerciseGroupSetSecondary = new Set<string>();

  const exerciseGroupStrings = exercise_group_map_string_secondary.split(",");

  for (const str of exerciseGroupStrings) {
    const exerciseGroupAndMultiplier = str.split("x");

    const exerciseGroup = exerciseGroupAndMultiplier[0];
    const multiplier = exerciseGroupAndMultiplier[1];

    if (
      exerciseGroup !== undefined &&
      exerciseGroupDictionary.has(exerciseGroup) &&
      multiplier !== undefined &&
      !IsStringInvalidNumber(multiplier, 0, false, 1)
    ) {
      exerciseGroupSetSecondary.add(exerciseGroup);
    }
  }

  return exerciseGroupSetSecondary;
};
