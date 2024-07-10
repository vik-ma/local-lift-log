import { Exercise, WorkoutSet, Multiset } from "../../typings";
import Database from "tauri-plugin-sql-api";
import { GenerateSetOrderList, GetExerciseFromId, GetSetFromId } from "..";

type MultisetExerciseAndSetList = {
  exerciseList: Exercise[];
  setList: WorkoutSet[];
};

export const GetMultisetExerciseAndSetList = async (
  multisetId: number
): Promise<MultisetExerciseAndSetList> => {
  const multisetExerciseAndSetList: MultisetExerciseAndSetList = {
    exerciseList: [],
    setList: [],
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

      multisetExerciseAndSetList.setList.push(set);
      multisetExerciseAndSetList.exerciseList.push(exercise);
    }

    return multisetExerciseAndSetList;
  } catch (error) {
    console.log(error);
    return {
      exerciseList: [],
      setList: [],
    };
  }
};
