import { Exercise, Workout, WorkoutSet, WorkoutTemplate } from "../../typings";
import { GetSetFromId, GetExerciseFromId, InsertSetIntoDatabase } from "..";

type AddNewSetsToMultisetReturnType = {
  setListIdList: number[][];
  setListList: WorkoutSet[][];
  exerciseListList: Exercise[][];
};

export const AddNewSetsToMultiset = async (
  numSetsToAdd: number,
  setListIds: number[],
  isTemplate: boolean,
  multisetId: number,
  workout: Workout | undefined,
  workoutTemplate: WorkoutTemplate | undefined
): Promise<AddNewSetsToMultisetReturnType> => {
  const setListIdList: number[][] = Array.from(
    { length: numSetsToAdd },
    () => []
  );
  const setListList: WorkoutSet[][] = Array.from(
    { length: numSetsToAdd },
    () => []
  );
  const exerciseListList: Exercise[][] = Array.from(
    { length: numSetsToAdd },
    () => []
  );

  for (let i = 0; i < setListIds.length; i++) {
    const set = await GetSetFromId(setListIds[i]);

    if (set === undefined) continue;

    const exercise = await GetExerciseFromId(set.exercise_id);

    set.is_template = isTemplate ? 1 : 0;
    set.multiset_id = multisetId;

    if (isTemplate && workoutTemplate) {
      set.workout_template_id = workoutTemplate.id;
    }

    if (!isTemplate && workout) {
      set.workout_id = workout.id;
    }

    for (let j = 0; j < numSetsToAdd; j++) {
      const setId = await InsertSetIntoDatabase(set);

      if (setId === 0) continue;

      const newSet = { ...set, id: setId };

      setListIdList[j].push(setId);
      setListList[j].push(newSet);
      exerciseListList[j].push(exercise);
    }
  }

  return { setListIdList, setListList, exerciseListList };
};
