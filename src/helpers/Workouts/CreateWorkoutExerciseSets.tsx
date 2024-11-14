import { ExerciseGroupMap } from "../../typings";
import { CreateExerciseGroupSetPrimary } from "../Exercises/CreateExerciseGroupSetPrimary";
import { CreateExerciseGroupSetSecondary } from "../Exercises/CreateExerciseGroupSetSecondary";

type CreateWorkoutExerciseSetsReturnType = {
  exerciseIdSet: Set<number>;
  exerciseGroupSetPrimary: Set<string>;
  exerciseGroupSetSecondary: Set<string>;
};

type WorkoutExerciseQueryItem = {
  id: number;
  exercise_group_set_string_primary: string;
  exercise_group_set_string_secondary: string;
};

export const CreateWorkoutExerciseSets = (
  exerciseListString: string | undefined,
  exerciseGroupDictionary: ExerciseGroupMap
): CreateWorkoutExerciseSetsReturnType => {
  try {
    const workoutExerciseSets = {
      exerciseIdSet: new Set<number>(),
      exerciseGroupSetPrimary: new Set<string>(),
      exerciseGroupSetSecondary: new Set<string>(),
    };

    if (exerciseListString === undefined) return workoutExerciseSets;

    const exerciseList: WorkoutExerciseQueryItem[] =
      JSON.parse(exerciseListString);

    const workoutExerciseGroupsPrimary: Set<string>[] = [];
    const workoutExerciseGroupsSecondary: Set<string>[] = [];

    for (const exercise of exerciseList) {
      workoutExerciseSets.exerciseIdSet.add(exercise.id);

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
