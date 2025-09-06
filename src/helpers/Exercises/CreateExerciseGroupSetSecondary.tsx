import { IsStringInvalidNumber } from "..";
import { ExerciseGroupMap } from "../../typings";

export const CreateExerciseGroupSetSecondary = (
  exercise_group_map_string_secondary: string,
  exerciseGroupDictionary: ExerciseGroupMap
) => {
  const exerciseGroupSetSecondary = new Set<string>();

  const exerciseGroupStrings = exercise_group_map_string_secondary.split(",");

  const minValue = 0;
  const doNotAllowMinValue = false;
  const maxValue = 1;

  for (const str of exerciseGroupStrings) {
    const exerciseGroupAndMultiplier = str.split("x");

    const exerciseGroup = exerciseGroupAndMultiplier[0];
    const multiplier = exerciseGroupAndMultiplier[1];

    if (
      exerciseGroup !== undefined &&
      exerciseGroupDictionary.has(exerciseGroup) &&
      multiplier !== undefined &&
      !IsStringInvalidNumber(multiplier, minValue, doNotAllowMinValue, maxValue)
    ) {
      exerciseGroupSetSecondary.add(exerciseGroup);
    }
  }

  return exerciseGroupSetSecondary;
};
