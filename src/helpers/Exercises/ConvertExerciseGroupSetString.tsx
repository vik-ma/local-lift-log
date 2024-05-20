import { ExerciseGroupDictionary } from "..";

type ConvertedExerciseGroupSet = {
  list: string[];
  formattedString: string;
};

export const ConvertExerciseGroupSetString = (
  exerciseGroupSetString: string
): ConvertedExerciseGroupSet => {
  const exerciseGroups: string[] = exerciseGroupSetString.split(",");
  const EXERCISE_GROUP_DICTIONARY = ExerciseGroupDictionary();

  const exerciseGroupNumberList: string[] = [];
  const exerciseGroupNameList: string[] = [];

  exerciseGroups.map((group: string) => {
    if (EXERCISE_GROUP_DICTIONARY.has(group)) {
      exerciseGroupNameList.push(EXERCISE_GROUP_DICTIONARY.get(group)!);
      exerciseGroupNumberList.push(group);
    }
  });

  const formattedString: string = [...exerciseGroupNameList].join(", ");

  return { list: exerciseGroupNumberList, formattedString: formattedString };
};
