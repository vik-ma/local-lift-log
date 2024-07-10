import {
  WorkoutSet,
  GroupedWorkoutSet,
  Exercise,
  Multiset,
} from "../../typings";
import { GetExerciseFromId } from "../Exercises/GetExerciseFromId";
import { GetMultisetGroupedSet } from "../Sets/GetMultisetGroupedSet";
import { ValidateExerciseOrderEntry } from "./ValidateExerciseOrderEntry";

type GroupedWorkoutSets = {
  [exerciseId: string]: {
    exerciseList: Exercise[];
    setList: WorkoutSet[];
    isExpanded: boolean;
    isMultiset?: boolean;
    multiset?: Multiset;
  };
};

export const CreateGroupedWorkoutSetListByExerciseId = async (
  setList: WorkoutSet[],
  exercise_order: string
) => {
  const groupedWorkoutSets: GroupedWorkoutSets = {};

  const orderArray: string[] = exercise_order.split(",");

  for (let i = 0; i < orderArray.length; i++) {
    const entry: string = orderArray[i];

    const validatedEntry = ValidateExerciseOrderEntry(entry);

    if (!validatedEntry.isValid) continue;

    if (!validatedEntry.isMultiset) {
      const exercise = await GetExerciseFromId(validatedEntry.id);

      groupedWorkoutSets[entry] = {
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

      groupedWorkoutSets[entry] = {
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
      groupedWorkoutSets[set.exercise_id.toString()] &&
      set.multiset_id === 0
    ) {
      groupedWorkoutSets[set.exercise_id.toString()].setList.push(set);
    }
  });

  // Remove any exercises that may exist in exercise_order, but have no sets in setList
  // (exerciseId keys with an empty setList)
  const groupedWorkoutSetList: GroupedWorkoutSet[] = Object.values(
    groupedWorkoutSets
  ).filter((value) => value.setList.length > 0);

  // Sort the groupedWorkoutSetList array based on the exercise_order string
  groupedWorkoutSetList.sort((a, b) => {
    const indexA = orderArray.indexOf(a.exerciseList[0].id.toString());
    const indexB = orderArray.indexOf(b.exerciseList[0].id.toString());
    return indexA - indexB;
  });

  return groupedWorkoutSetList;
};
