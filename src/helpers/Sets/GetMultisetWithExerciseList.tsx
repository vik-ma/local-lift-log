import { Exercise, Multiset } from "../../typings";
import Database from "tauri-plugin-sql-api";
import { GenerateSetOrderList, GetExerciseFromId, GetSetFromId } from "..";

type MultisetWithExerciseList = {
  multiset: Multiset | undefined;
  exerciseList: Exercise[];
};

export const GetMultisetWithExerciseList = async (
  multisetId: number
): Promise<MultisetWithExerciseList> => {
  const multisetExerciseAndSetList: MultisetWithExerciseList = {
    multiset: undefined,
    exerciseList: [],
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

    for (let i = 0; i < setOrderList.length; i++) {
      const set = await GetSetFromId(setOrderList[i]);

      if (set === undefined) continue;

      const exercise = await GetExerciseFromId(set.exercise_id);

      multisetExerciseAndSetList.exerciseList.push(exercise);
    }

    return multisetExerciseAndSetList;
  } catch (error) {
    console.log(error);
    return multisetExerciseAndSetList;
  }
};
