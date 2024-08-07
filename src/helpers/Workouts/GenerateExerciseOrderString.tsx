import { GroupedWorkoutSet } from "../../typings";

export const GenerateExerciseOrderString = (
  groupedSetList: GroupedWorkoutSet[]
): string => {
  const exerciseOrderString = groupedSetList.map((obj) => obj.id).join(",");

  return exerciseOrderString;
};
