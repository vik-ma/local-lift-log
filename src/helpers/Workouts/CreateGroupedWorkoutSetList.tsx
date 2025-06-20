import {
  WorkoutSet,
  GroupedWorkoutSet,
  Exercise,
  Multiset,
  ExerciseGroupMap,
} from "../../typings";
import {
  GetExerciseWithId,
  GetMultisetGroupedSet,
  GetValidatedUnit,
  ValidateExerciseOrderEntry,
} from "..";

type GroupedWorkoutSetsDictionary = {
  [id: string]: {
    id: string;
    exerciseList: Exercise[];
    setList: WorkoutSet[];
    isExpanded: boolean;
    showGroupedSetNote: boolean;
    isMultiset?: boolean;
    multiset?: Multiset;
  };
};

export type CreateGroupedWorkoutSetListReturnType = {
  groupedSetList: GroupedWorkoutSet[];
  shouldUpdateExerciseOrder?: boolean;
};

export const CreateGroupedWorkoutSetList = async (
  setList: WorkoutSet[],
  exercise_order: string,
  exerciseGroupDictionary: ExerciseGroupMap
): Promise<CreateGroupedWorkoutSetListReturnType> => {
  const groupedWorkoutSetsDictionary: GroupedWorkoutSetsDictionary = {};

  let shouldUpdateExerciseOrder = false;

  const orderArray: string[] = exercise_order.split(",");

  for (let i = 0; i < orderArray.length; i++) {
    const entry: string = orderArray[i];

    const validatedEntry = ValidateExerciseOrderEntry(entry);

    if (!validatedEntry.isValid) continue;

    if (!validatedEntry.isMultiset) {
      // If not Multiset
      const exercise = await GetExerciseWithId(
        validatedEntry.id,
        exerciseGroupDictionary
      );

      groupedWorkoutSetsDictionary[entry] = {
        id: entry,
        exerciseList: [exercise],
        setList: [],
        isExpanded: true,
        showGroupedSetNote: exercise.note ? true : false,
      };
    } else {
      // If Multiset
      const multisetSetList = setList.filter(
        (set) => set.multiset_id === validatedEntry.id
      );

      const multisetGroupedSet = await GetMultisetGroupedSet(
        validatedEntry.id,
        multisetSetList,
        exerciseGroupDictionary
      );

      if (multisetGroupedSet.multiset.id === 0) continue;

      groupedWorkoutSetsDictionary[entry] = {
        id: entry,
        exerciseList: multisetGroupedSet.exerciseList,
        setList: multisetGroupedSet.orderedSetList,
        isExpanded: true,
        showGroupedSetNote: multisetGroupedSet.multiset.note ? true : false,
        isMultiset: true,
        multiset: multisetGroupedSet.multiset,
      };
    }
  }

  const unassignedSetMap = new Map<number, WorkoutSet[]>();

  for (const set of setList) {
    set.weight_unit = GetValidatedUnit(set.weight_unit, "weight");
    set.distance_unit = GetValidatedUnit(set.distance_unit, "distance");
    set.user_weight_unit = GetValidatedUnit(set.user_weight_unit, "weight");

    if (set.multiset_id !== 0) continue;

    if (groupedWorkoutSetsDictionary[set.exercise_id.toString()]) {
      groupedWorkoutSetsDictionary[set.exercise_id.toString()].setList.push(
        set
      );
    } else {
      if (unassignedSetMap.has(set.exercise_id)) {
        unassignedSetMap.get(set.exercise_id)!.push(set);
      } else {
        unassignedSetMap.set(set.exercise_id, [set]);
      }
    }
  }

  if (unassignedSetMap.size > 0) {
    // Add sets in setList that are not in exercise_order string
    for (const [exerciseId, setList] of unassignedSetMap) {
      const exercise = await GetExerciseWithId(
        exerciseId,
        exerciseGroupDictionary
      );

      const entry = exerciseId.toString();

      groupedWorkoutSetsDictionary[entry] = {
        id: entry,
        exerciseList: [exercise],
        setList: setList,
        isExpanded: true,
        showGroupedSetNote: exercise.note ? true : false,
      };
    }

    shouldUpdateExerciseOrder = true;
  }

  // Remove any exercises that may exist in exercise_order, but have no sets in setList
  // (exerciseId keys with an empty setList)
  const groupedWorkoutSetList: GroupedWorkoutSet[] = Object.values(
    groupedWorkoutSetsDictionary
  ).filter((value) => value.setList.length > 0);

  // Sort the groupedWorkoutSetList array based on the exercise_order string
  groupedWorkoutSetList.sort((a, b) => {
    const indexA = orderArray.indexOf(a.id);
    const indexB = orderArray.indexOf(b.id);
    return indexA - indexB;
  });

  return { groupedSetList: groupedWorkoutSetList, shouldUpdateExerciseOrder };
};
