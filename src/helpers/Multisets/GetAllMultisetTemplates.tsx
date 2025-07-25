import Database from "@tauri-apps/plugin-sql";
import {
  ExerciseGroupMap,
  ExerciseMap,
  Multiset,
  WorkoutSet,
} from "../../typings";
import {
  GenerateMultisetSetOrderList,
  GetSetWithId,
  UpdateMultiset,
  GenerateSetListText,
  CreateExerciseSetIds,
  GetValidatedMultisetType,
} from "..";

export const GetAllMultisetTemplates = async (
  exerciseGroupDictionary: ExerciseGroupMap,
  exerciseMap: ExerciseMap
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<Multiset[]>(
      `SELECT * FROM multisets WHERE is_template = 1`
    );

    const multisets: Multiset[] = [];

    for (let i = 0; i < result.length; i++) {
      const validatedMultisetType = GetValidatedMultisetType(
        result[i].multiset_type
      );
      result[i].multiset_type = validatedMultisetType;

      const setOrderList = GenerateMultisetSetOrderList(result[i].set_order);

      if (setOrderList.length === 0) continue;

      const setList: WorkoutSet[] = [];

      const setIdsToDelete: number[] = [];

      const exerciseIdSet: Set<number> = new Set();

      for (let i = 0; i < setOrderList.length; i++) {
        const set = await GetSetWithId(setOrderList[i]);

        if (set === undefined) {
          setIdsToDelete.push(setOrderList[i]);
          continue;
        }

        setList.push(set);

        exerciseIdSet.add(set.exercise_id);
      }

      if (setList.length === 0) {
        // Delete Multiset if no Sets has been found
        await db.execute("DELETE from multisets WHERE id = $1", [result[i].id]);
        continue;
      }

      if (setIdsToDelete.length > 0) {
        // Remove set from current Multiset's set_order if a Set has been deleted
        const newSetList = setOrderList.filter(
          (item) => !setIdsToDelete.includes(item)
        );

        const newSetOrder = newSetList.join(",");

        result[i].set_order = newSetOrder;

        await UpdateMultiset(result[i]);
      }

      result[i].setList = setList;

      const setListValues = GenerateSetListText(setList);
      result[i].setListText = setListValues.setListText;
      result[i].setListTextString = setListValues.setListTextString;

      const exerciseIds = CreateExerciseSetIds(
        JSON.stringify(Array.from(exerciseIdSet)),
        exerciseGroupDictionary,
        exerciseMap
      );

      result[i].exerciseIdSet = exerciseIds.exerciseIdSet;
      result[i].exerciseGroupSetPrimary = exerciseIds.exerciseGroupSetPrimary;
      result[i].exerciseGroupSetSecondary =
        exerciseIds.exerciseGroupSetSecondary;

      multisets.push(result[i]);
    }

    return multisets;
  } catch (error) {
    console.log(error);
    return [];
  }
};
