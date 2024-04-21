import { WorkoutSet, GroupedWorkoutSet } from "../../typings";

type GroupedWorkoutSets = {
  [exerciseId: number]: {
    exercise_name: string;
    exercise_id: number;
    setList: WorkoutSet[];
  };
};

export const CreateGroupedWorkoutSetListByExerciseId = (
  setList: WorkoutSet[],
  exercise_order: string
): GroupedWorkoutSet[] => {
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

  const groupedWorkoutSetList: GroupedWorkoutSet[] =
    Object.values(groupedWorkoutSets);

  const orderArray: number[] = exercise_order.split(",").map(Number);

  // Sort the groupedWorkoutSetList array based on the exercise_order string
  groupedWorkoutSetList.sort((a, b) => {
    const indexA = orderArray.indexOf(a.exercise_id);
    const indexB = orderArray.indexOf(b.exercise_id);
    return indexA - indexB;
  });

  return groupedWorkoutSetList;
};
