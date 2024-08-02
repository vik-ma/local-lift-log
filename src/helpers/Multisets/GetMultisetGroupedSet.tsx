import { Exercise, Multiset, WorkoutSet } from "../../typings";
import Database from "tauri-plugin-sql-api";
import {
  DefaultNewMultiset,
  GenerateMultisetSetOrderList,
  GetExerciseFromId,
} from "..";

type MultisetGroupedSet = {
  multiset: Multiset;
  exerciseList: Exercise[];
  orderedSetList: WorkoutSet[];
};

export const GetMultisetGroupedSet = async (
  multisetId: number,
  setList: WorkoutSet[]
): Promise<MultisetGroupedSet> => {
  const multisetExerciseAndSetList: MultisetGroupedSet = {
    multiset: DefaultNewMultiset(),
    exerciseList: [],
    orderedSetList: [],
  };

  const setListIndexCutoffs = new Map<number, number>();

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<Multiset[]>(
      `SELECT * FROM multisets WHERE id = $1`,
      [multisetId]
    );

    const multiset = result[0];

    if (multiset === undefined) return multisetExerciseAndSetList;

    // Split sets of Multiset
    const multisetStrings = multiset.set_order.split("/");

    const setOrderList: number[] = [];

    let indexCounter = 0;
    let setCounter = 1;

    // Loop through every set in Multiset
    for (const multisetString of multisetStrings) {
      const currentSetOrderList = GenerateMultisetSetOrderList(multisetString);

      setOrderList.push(...currentSetOrderList);

      // Get the index where new Set starts
      setListIndexCutoffs.set(indexCounter, setCounter);

      indexCounter = indexCounter + currentSetOrderList.length;
      setCounter++;
    }

    const orderedSetList = setList.sort((a, b) => {
      const indexA = setOrderList.indexOf(a.id);
      const indexB = setOrderList.indexOf(b.id);
      return indexA - indexB;
    });

    for (let i = 0; i < orderedSetList.length; i++) {
      const exercise = await GetExerciseFromId(orderedSetList[i].exercise_id);

      if (exercise.isInvalid) {
        orderedSetList[i].hasInvalidExerciseId = true;
      }

      multisetExerciseAndSetList.exerciseList.push(exercise);
    }

    multiset.setList = orderedSetList;
    multiset.setListIndexCutoffs = setListIndexCutoffs;

    multisetExerciseAndSetList.orderedSetList = orderedSetList;
    multisetExerciseAndSetList.multiset = multiset;

    return multisetExerciseAndSetList;
  } catch (error) {
    console.log(error);
    return multisetExerciseAndSetList;
  }
};
