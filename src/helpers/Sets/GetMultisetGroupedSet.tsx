import { Exercise, Multiset, WorkoutSet } from "../../typings";
import Database from "tauri-plugin-sql-api";
import { GenerateSetOrderList, GetExerciseFromId } from "..";

type MultisetGroupedSet = {
  multiset: Multiset | undefined;
  exerciseList: Exercise[];
  orderedSetList: WorkoutSet[];
};

export const GetMultisetGroupedSet = async (
  multisetId: number,
  setList: WorkoutSet[]
): Promise<MultisetGroupedSet> => {
  const multisetExerciseAndSetList: MultisetGroupedSet = {
    multiset: undefined,
    exerciseList: [],
    orderedSetList: [],
  };

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<Multiset[]>(
      `SELECT * FROM multisets WHERE id = $1`,
      [multisetId]
    );

    const multiset = result[0];

    if (multiset === undefined) return multisetExerciseAndSetList;

    const setOrderList = GenerateSetOrderList(multiset.set_order);

    const orderedSetList = setList.sort((a, b) => {
      const indexA = setOrderList.indexOf(a.exercise_id);
      const indexB = setOrderList.indexOf(b.exercise_id);
      return indexA - indexB;
    });

    for (let i = 0; i < orderedSetList.length; i++) {
      const exercise = await GetExerciseFromId(orderedSetList[i].exercise_id);

      multisetExerciseAndSetList.exerciseList.push(exercise);
    }

    multisetExerciseAndSetList.orderedSetList = orderedSetList;
    multisetExerciseAndSetList.multiset = multiset;

    return multisetExerciseAndSetList;
  } catch (error) {
    console.log(error);
    return multisetExerciseAndSetList;
  }
};
