import { GroupedWorkoutSet } from "../../typings";

export const GenerateExerciseOrderString = (
  groupedSetList: GroupedWorkoutSet[]
): string => {
  const exerciseOrderString = groupedSetList
    .map((obj) => obj.exercise_id)
    .join(",");

  return exerciseOrderString;
};
