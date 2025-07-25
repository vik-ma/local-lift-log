import { GroupedWorkoutSet } from "../../typings";

export const GenerateExerciseOrderString = (
  groupedSetList: GroupedWorkoutSet[]
) => {
  const exerciseOrderString = groupedSetList.map((obj) => obj.id).join(",");

  return exerciseOrderString;
};
