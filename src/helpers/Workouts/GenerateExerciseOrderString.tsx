import { GroupedWorkoutSet } from "../../typings";

export const GenerateExerciseOrderString = (
  groupedSetList: GroupedWorkoutSet[]
): string => {
  const exerciseOrderString = groupedSetList
    .map((obj) => obj.exerciseList[0].id)
    .join(",");

  return exerciseOrderString;
};
