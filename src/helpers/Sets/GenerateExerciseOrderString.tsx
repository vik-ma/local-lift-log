import { GroupedWorkoutSetList } from "../../typings";

export const GenerateExerciseOrderString = (
  groupedSetList: GroupedWorkoutSetList[]
): string => {
  const exerciseOrderString = groupedSetList
    .map((obj) => obj.exercise_id)
    .join(",");

  return exerciseOrderString;
};
