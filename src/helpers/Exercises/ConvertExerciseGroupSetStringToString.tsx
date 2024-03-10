import { ExerciseGroupDictionary } from "./ExerciseGroupDictionary";

export const ConvertExerciseGroupSetStringToString = (
  exerciseGroupSetString: string
): string => {
  const exerciseGroups: string[] = exerciseGroupSetString.split(",");
  const exerciseGroupDictionary = ExerciseGroupDictionary();

  const exerciseGroupSet = new Set<string>();

  exerciseGroups.map((group: string) => {
    if (exerciseGroupDictionary.has(group))
      exerciseGroupSet.add(exerciseGroupDictionary.get(group)!);
  });

  const formattedString: string = [...exerciseGroupSet].join(", ");

  return formattedString;
};
