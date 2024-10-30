import { ExerciseGroupDictionary, IsStringValidNumberBetween0And1 } from "..";

export const ConvertExerciseGroupSetStringSecondary = (
  exerciseGroupSetString: string
) => {
  const exerciseGroups = exerciseGroupSetString.split(",");
  const EXERCISE_GROUP_DICTIONARY = ExerciseGroupDictionary();

  const exerciseGroupNameList: string[] = [];
  const exerciseGroupMultiplierMap: Map<string, string> = new Map();

  for (const str of exerciseGroups) {
    const exerciseGroupAndMultiplier = str.split("x");

    const exerciseGroup = exerciseGroupAndMultiplier[0];
    const multiplier = exerciseGroupAndMultiplier[1];

    if (
      exerciseGroup !== undefined &&
      EXERCISE_GROUP_DICTIONARY.has(exerciseGroup) &&
      multiplier !== undefined &&
      IsStringValidNumberBetween0And1(multiplier)
    ) {
      exerciseGroupNameList.push(EXERCISE_GROUP_DICTIONARY.get(exerciseGroup)!);
      exerciseGroupMultiplierMap.set(exerciseGroup, multiplier);
    }
  }

  const formattedString: string = [...exerciseGroupNameList].join(", ");

  return { map: exerciseGroupMultiplierMap, formattedString: formattedString };
};
