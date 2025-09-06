import { IsStringInvalidNumber } from "..";
import { Exercise, ExerciseGroupMap } from "../../typings";

export const LoadExerciseGroupSetStringSecondary = (
  exercise: Exercise,
  exerciseGroupDictionary: ExerciseGroupMap,
  exerciseGroupSetPrimary: Set<string>
) => {
  if (exercise.exercise_group_map_string_secondary === null) {
    return exercise;
  }

  const exerciseGroups =
    exercise.exercise_group_map_string_secondary.split(",");

  const exerciseGroupNameList: string[] = [];
  const exerciseGroupMultiplierMap: Map<string, string> = new Map();

  const minValue = 0;
  const doNotAllowMinValue = true;
  const maxValue = 1;

  for (const str of exerciseGroups) {
    const exerciseGroupAndMultiplier = str.split("x");

    const exerciseGroup = exerciseGroupAndMultiplier[0];
    const multiplier = exerciseGroupAndMultiplier[1];

    if (
      exerciseGroup !== undefined &&
      exerciseGroupDictionary.has(exerciseGroup) &&
      !exerciseGroupSetPrimary.has(exerciseGroup) &&
      !exerciseGroupMultiplierMap.has(exerciseGroup) &&
      multiplier !== undefined &&
      !IsStringInvalidNumber(multiplier, minValue, doNotAllowMinValue, maxValue)
    ) {
      exerciseGroupNameList.push(exerciseGroupDictionary.get(exerciseGroup)!);
      exerciseGroupMultiplierMap.set(exerciseGroup, multiplier);
    }
  }

  if (exerciseGroupMultiplierMap.size === 0) {
    exercise.exercise_group_map_string_secondary = null;
    return exercise;
  }

  const formattedString: string = [...exerciseGroupNameList].join(", ");

  exercise.exerciseGroupStringMapSecondary = exerciseGroupMultiplierMap;
  exercise.formattedGroupStringSecondary = formattedString;

  return exercise;
};
