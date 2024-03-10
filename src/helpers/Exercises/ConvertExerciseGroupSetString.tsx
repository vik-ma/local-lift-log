import { ExerciseGroupDictionary } from "./ExerciseGroupDictionary";

type ConvertedExerciseGroupSet = {
  set: Set<string>;
  formattedString: string;
};

export const ConvertExerciseGroupSetString = (
  exerciseGroupSetString: string
): ConvertedExerciseGroupSet => {
  const exerciseGroups: string[] = exerciseGroupSetString.split(",");
  const exerciseGroupDictionary = ExerciseGroupDictionary();

  const exerciseGroupSet = new Set<string>();

  exerciseGroups.map((group: string) => {
    if (exerciseGroupDictionary.has(group))
      exerciseGroupSet.add(exerciseGroupDictionary.get(group)!);
  });

  const formattedString: string = [...exerciseGroupSet].join(", ");

  return { set: exerciseGroupSet, formattedString: formattedString };
};
