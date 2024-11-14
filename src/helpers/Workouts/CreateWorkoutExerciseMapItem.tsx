import { WorkoutExerciseMapItem } from "../../typings";
import { CreateExerciseGroupSet } from "../Exercises/CreateExerciseGroupSet";

type WorkoutExerciseQueryItem = {
  id: number;
  name: string;
  exercise_group_set_string_primary: string;
};

export const CreateWorkoutExerciseMapItem = (
  exerciseListString: string | undefined
): Map<number, WorkoutExerciseMapItem | null> => {
  try {
    const exerciseMap: Map<number, WorkoutExerciseMapItem | null> = new Map();

    if (exerciseListString === undefined) return exerciseMap;

    const exerciseList: WorkoutExerciseQueryItem[] =
      JSON.parse(exerciseListString);

    for (const exercise of exerciseList) {
      if (
        exercise.name === null ||
        exercise.exercise_group_set_string_primary === null
      ) {
        exerciseMap.set(exercise.id, null);
        continue;
      }

      const exerciseGroupSet = CreateExerciseGroupSet(
        exercise.exercise_group_set_string_primary
      );

      const exerciseMapItem: WorkoutExerciseMapItem = {
        ...exercise,
        exerciseGroupSet,
      };

      exerciseMap.set(exercise.id, exerciseMapItem);
    }

    return exerciseMap;
  } catch {
    return new Map();
  }
};
