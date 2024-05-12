import { ExerciseGroupDictionary } from "..";

type ConvertedExerciseGroupSet = {
  list: string[];
  formattedString: string;
};

export const ConvertExerciseGroupSetString = (
  exerciseGroupSetString: string
): ConvertedExerciseGroupSet => {
  const exerciseGroups: string[] = exerciseGroupSetString.split(",");
  const exerciseGroupDictionary = ExerciseGroupDictionary();

  const exerciseGroupNumberList: string[] = [];
  const exerciseGroupNameList: string[] = [];

  exerciseGroups.map((group: string) => {
    if (exerciseGroupDictionary.has(group)) {
      exerciseGroupNameList.push(exerciseGroupDictionary.get(group)!);
      exerciseGroupNumberList.push(group);
    }
  });

  const formattedString: string = [...exerciseGroupNameList].join(", ");

  return { list: exerciseGroupNumberList, formattedString: formattedString };
};
