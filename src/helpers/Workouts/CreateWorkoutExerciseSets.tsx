import { ExerciseGroupMap, ExerciseMap } from "../../typings";
import { CreateExerciseGroupSetPrimary } from "../Exercises/CreateExerciseGroupSetPrimary";
import { CreateExerciseGroupSetSecondary } from "../Exercises/CreateExerciseGroupSetSecondary";

type CreateWorkoutExerciseSetsReturnType = {
  exerciseIdSet: Set<number>;
  exerciseGroupSetPrimary: Set<string>;
  exerciseGroupSetSecondary: Set<string>;
};

export const CreateWorkoutExerciseSets = (
  exerciseListString: string | undefined,
  exerciseGroupDictionary: ExerciseGroupMap,
  exerciseMap: ExerciseMap
): CreateWorkoutExerciseSetsReturnType => {
  try {
    const workoutExerciseSets: CreateWorkoutExerciseSetsReturnType = {
      exerciseIdSet: new Set<number>(),
      exerciseGroupSetPrimary: new Set<string>(),
      exerciseGroupSetSecondary: new Set<string>(),
    };

    if (exerciseListString === undefined) return workoutExerciseSets;

    const exerciseIdList: number[] = JSON.parse(exerciseListString);

    const workoutExerciseGroupsPrimary: Set<string>[] = [];
    const workoutExerciseGroupsSecondary: Set<string>[] = [];

    for (const id of exerciseIdList) {
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

      if (exercise.exercise_group_set_string_secondary !== null) {
        const exerciseGroupsSecondary = CreateExerciseGroupSetSecondary(
          exercise.exercise_group_set_string_secondary,
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
  } catch {
    return {
      exerciseIdSet: new Set<number>(),
      exerciseGroupSetPrimary: new Set<string>(),
      exerciseGroupSetSecondary: new Set<string>(),
    };
  }
};
