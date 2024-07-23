import {
  WorkoutSet,
  GroupedWorkoutSet,
  Exercise,
  Multiset,
} from "../../typings";
import {
  GetExerciseFromId,
  GetMultisetGroupedSet,
  ValidateExerciseOrderEntry,
} from "..";

type GroupedWorkoutSetsDictionary = {
  [id: string]: {
    id: string;
    exerciseList: Exercise[];
    setList: WorkoutSet[];
    isExpanded: boolean;
    isMultiset?: boolean;
    multiset?: Multiset;
  };
};

export const CreateGroupedWorkoutSetList = async (
  setList: WorkoutSet[],
  exercise_order: string
) => {
  const groupedWorkoutSetsDictionary: GroupedWorkoutSetsDictionary = {};

  const orderArray: string[] = exercise_order.split(",");

  for (let i = 0; i < orderArray.length; i++) {
    const entry: string = orderArray[i];

    const validatedEntry = ValidateExerciseOrderEntry(entry);

    if (!validatedEntry.isValid) continue;

    if (!validatedEntry.isMultiset) {
      const exercise = await GetExerciseFromId(validatedEntry.id);

      groupedWorkoutSetsDictionary[entry] = {
        id: entry,
        exerciseList: [exercise],
        setList: [],
        isExpanded: true,
      };
    } else {
      const multisetSetList = setList.filter(
        (set) => set.multiset_id === validatedEntry.id
      );

      const multisetGroupedSet = await GetMultisetGroupedSet(
        validatedEntry.id,
        multisetSetList
      );

      groupedWorkoutSetsDictionary[entry] = {
        id: entry,
        exerciseList: multisetGroupedSet.exerciseList,
        setList: multisetGroupedSet.orderedSetList,
        isExpanded: true,
        isMultiset: true,
        multiset: multisetGroupedSet.multiset,
      };
    }
  }

  setList.map((set) => {
    if (
      groupedWorkoutSetsDictionary[set.exercise_id.toString()] &&
      set.multiset_id === 0
    ) {
      groupedWorkoutSetsDictionary[set.exercise_id.toString()].setList.push(
        set
      );
    }
  });

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

  return groupedWorkoutSetList;
};
