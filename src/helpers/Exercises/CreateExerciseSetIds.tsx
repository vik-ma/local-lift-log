import { ExerciseGroupMap, ExerciseMap } from "../../typings";
import {
  CreateExerciseGroupSetPrimary,
  CreateExerciseGroupSetSecondary,
} from "..";

type CreateExerciseSetIdsReturnType = {
  exerciseIdSet: Set<number>;
  exerciseGroupSetPrimary: Set<string>;
  exerciseGroupSetSecondary: Set<string>;
};

export const CreateExerciseSetIds = (
  exerciseIdList: string | undefined,
  exerciseGroupDictionary: ExerciseGroupMap,
  exerciseMap: ExerciseMap
): CreateExerciseSetIdsReturnType => {
  try {
    const workoutExerciseSets: CreateExerciseSetIdsReturnType = {
      exerciseIdSet: new Set<number>(),
      exerciseGroupSetPrimary: new Set<string>(),
      exerciseGroupSetSecondary: new Set<string>(),
    };

    if (exerciseIdList === undefined) return workoutExerciseSets;

    const exerciseIdNumList: number[] = JSON.parse(exerciseIdList);

    const workoutExerciseGroupsPrimary: Set<string>[] = [];
    const workoutExerciseGroupsSecondary: Set<string>[] = [];

    for (const id of exerciseIdNumList) {
      workoutExerciseSets.exerciseIdSet.add(id);

      const exercise = exerciseMap.get(id);

      if (exercise === undefined) continue;

      if (exercise.exercise_group_set_string_primary !== null) {
        const exerciseGroupsPrimary = CreateExerciseGroupSetPrimary(
          exercise.exercise_group_set_string_primary,
          exerciseGroupDictionary
        );
        workoutExerciseGroupsPrimary.push(exerciseGroupsPrimary);
      }

      if (exercise.exercise_group_map_string_secondary !== null) {
        const exerciseGroupsSecondary = CreateExerciseGroupSetSecondary(
          exercise.exercise_group_map_string_secondary,
          exerciseGroupDictionary
        );
        workoutExerciseGroupsSecondary.push(exerciseGroupsSecondary);
      }
    }

    const exerciseGroupSetPrimary = workoutExerciseGroupsPrimary.reduce(
      (acc, set) => new Set([...acc, ...set]),
      new Set()
    );

    const exerciseGroupSetSecondary = workoutExerciseGroupsSecondary.reduce(
      (acc, set) => new Set([...acc, ...set]),
      new Set()
    );

    workoutExerciseSets.exerciseGroupSetPrimary = exerciseGroupSetPrimary;
    workoutExerciseSets.exerciseGroupSetSecondary = exerciseGroupSetSecondary;

    return workoutExerciseSets;
  } catch (error) {
    console.log(error);
    return {
      exerciseIdSet: new Set<number>(),
      exerciseGroupSetPrimary: new Set<string>(),
      exerciseGroupSetSecondary: new Set<string>(),
    };
  }
};
