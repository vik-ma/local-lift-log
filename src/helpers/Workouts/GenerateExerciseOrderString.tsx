import { GroupedWorkoutSet } from "../../typings";

export const GenerateExerciseOrderString = (
  groupedSetList: GroupedWorkoutSet[]
): string => {
  // TODO: FIX FOR MULTISETS
  const exerciseOrderString = groupedSetList
    .map((obj) => obj.exerciseList[0].id)
    .join(",");

  return exerciseOrderString;
};
