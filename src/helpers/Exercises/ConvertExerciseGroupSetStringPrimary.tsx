import { ExerciseGroupMap } from "../../typings";

type ConvertedExerciseGroupSet = {
  set: Set<string>;
  formattedString: string;
};

export const ConvertExerciseGroupSetStringPrimary = (
  exerciseGroupSetString: string,
  exerciseGroupDictionary: ExerciseGroupMap
): ConvertedExerciseGroupSet => {
  const exerciseGroups: string[] = exerciseGroupSetString.split(",");

  const exerciseGroupNumberSet = new Set<string>();
  const exerciseGroupNameList: string[] = [];

  exerciseGroups.map((group: string) => {
    if (exerciseGroupDictionary.has(group)) {
      exerciseGroupNameList.push(exerciseGroupDictionary.get(group)!);
      exerciseGroupNumberSet.add(group);
    }
  });

  const formattedString: string = [...exerciseGroupNameList].join(", ");

  return { set: exerciseGroupNumberSet, formattedString: formattedString };
};
