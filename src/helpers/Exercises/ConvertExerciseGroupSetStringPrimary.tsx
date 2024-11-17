import { ExerciseGroupMap } from "../../typings";

type ConvertedExerciseGroupSet = {
  list: string[];
  formattedString: string;
};

export const ConvertExerciseGroupSetStringPrimary = (
  exerciseGroupSetString: string,
  exerciseGroupDictionary: ExerciseGroupMap
): ConvertedExerciseGroupSet => {
  const exerciseGroups: string[] = exerciseGroupSetString.split(",");

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
