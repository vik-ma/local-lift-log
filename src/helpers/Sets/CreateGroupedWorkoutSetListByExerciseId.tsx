import { WorkoutSet, GroupedWorkoutSetList } from "../../typings";

type GroupedWorkoutSets = {
  [exerciseId: number]: {
    exercise_name: string;
    exercise_id: number;
    setList: WorkoutSet[];
  };
};

export const CreateGroupedWorkoutSetListByExerciseId = (
  setList: WorkoutSet[]
): GroupedWorkoutSetList[] => {
  const groupedWorkoutSets: GroupedWorkoutSets = setList.reduce(
    (acc, workoutSet) => {
      const exercise_name: string =
        workoutSet.exercise_name ?? "Unknown Exercise";
      const exercise_id: number = workoutSet.exercise_id;

      if (!acc[exercise_id]) {
        acc[exercise_id] = {
          setList: [],
          exercise_name: exercise_name,
          exercise_id: exercise_id,
        };
      }

      acc[exercise_id].setList.push(workoutSet);

      return acc;
    },
    {} as GroupedWorkoutSets
  );

  const groupedWorkoutSetList: GroupedWorkoutSetList[] =
    Object.values(groupedWorkoutSets);

  return groupedWorkoutSetList;
};
