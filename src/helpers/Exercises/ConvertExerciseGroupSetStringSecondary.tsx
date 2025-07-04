import { IsStringInvalidNumber } from "..";
import { ExerciseGroupMap } from "../../typings";

export const ConvertExerciseGroupSetStringSecondary = (
  exerciseGroupMapStringSecondary: string,
  exerciseGroupDictionary: ExerciseGroupMap,
  exerciseGroupSetPrimary: Set<string>
) => {
  const exerciseGroups = exerciseGroupMapStringSecondary.split(",");

  const exerciseGroupNameList: string[] = [];
  const exerciseGroupMultiplierMap: Map<string, string> = new Map();

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
      !IsStringInvalidNumber(multiplier, 0, true, 1)
    ) {
      exerciseGroupNameList.push(exerciseGroupDictionary.get(exerciseGroup)!);
      exerciseGroupMultiplierMap.set(exerciseGroup, multiplier);
    }
  }

  const formattedString: string = [...exerciseGroupNameList].join(", ");

  return { map: exerciseGroupMultiplierMap, formattedString: formattedString };
};
