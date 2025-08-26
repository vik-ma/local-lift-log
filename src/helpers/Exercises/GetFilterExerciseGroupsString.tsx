import { ExerciseGroupMap } from "../../typings";

export const GetFilterExerciseGroupsString = (
  exerciseGroupList: string[],
  exerciseGroupDictionary: ExerciseGroupMap
) => {
  if (exerciseGroupList.length === 0) return "No Exercise Groups Selected";

  const exerciseGroupNames: string[] = [];

  for (const group of exerciseGroupList) {
    if (exerciseGroupDictionary.has(group)) {
      const groupName = exerciseGroupDictionary.get(group);
      exerciseGroupNames.push(groupName!);
    }
  }

  return exerciseGroupNames.join(", ");
};
