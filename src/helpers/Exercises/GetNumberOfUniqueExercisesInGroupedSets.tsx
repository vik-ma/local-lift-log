import { GroupedWorkoutSet } from "../../typings";

export const GetNumberOfUniqueExercisesInGroupedSets = (
  groupedSets: GroupedWorkoutSet[]
) => {
  const uniqueExerciseIds = new Set<number>();

  for (const group of groupedSets) {
    for (const exercise of group.exerciseList) {
      uniqueExerciseIds.add(exercise.id);
    }
  }

  return uniqueExerciseIds.size;
};
