import { ExerciseGroupDictionary } from "./ExerciseGroupDictionary";

type ConvertedExerciseGroupSet = {
  list: string[];
  formattedString: string;
};

export const ConvertExerciseGroupSetString = (
  exerciseGroupSetString: string
): ConvertedExerciseGroupSet => {
  const exerciseGroups: string[] = exerciseGroupSetString.split(",");
  const exerciseGroupDictionary = ExerciseGroupDictionary();

  const exerciseGroupSet: string[] = [];

  exerciseGroups.map((group: string) => {
    if (exerciseGroupDictionary.has(group))
      exerciseGroupSet.push(exerciseGroupDictionary.get(group)!);
  });

  const formattedString: string = [...exerciseGroupSet].join(", ");

  return { list: exerciseGroupSet, formattedString: formattedString };
};
