import { GroupedWorkoutSetList, WorkoutSet } from "../../typings";

export const CreateGroupedWorkoutSetListByExerciseId = (
  setList: WorkoutSet[]
): GroupedWorkoutSetList => {
  const groupedWorkoutSets: GroupedWorkoutSetList = setList.reduce(
    (acc, workoutSet) => {
      const exercise_name: string =
        workoutSet.exercise_name ?? "Unknown Exercise";

      if (!acc[exercise_name]) {
        acc[exercise_name] = [];
      }

      acc[exercise_name].push(workoutSet);

      return acc;
    },
    {} as GroupedWorkoutSetList
  );

  return groupedWorkoutSets;
};
