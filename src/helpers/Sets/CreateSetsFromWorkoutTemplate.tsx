import { ExerciseGroupMap, GroupedWorkoutSet, WorkoutSet } from "../../typings";
import Database from "@tauri-apps/plugin-sql";
import {
  CreateGroupedWorkoutSetList,
  GenerateMultisetSetListIdList,
  GenerateMultisetSetOrderString,
  GetExerciseOrder,
  GetMultisetWithId,
  GetValidatedMultisetType,
  GetValidatedUnit,
  InsertMultisetIntoDatabase,
  InsertSetIntoDatabase,
  ReplaceNumberIn2DList,
  UpdateMultiset,
} from "..";

export const CreateSetsFromWorkoutTemplate = async (
  newWorkoutOrTemplateId: number,
  workout_template_id: number,
  exerciseGroupDictionary: ExerciseGroupMap,
  createSetsForWorkoutTemplate?: boolean
): Promise<GroupedWorkoutSet[]> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<WorkoutSet[]>(
      `SELECT sets.*, exercises.name AS exercise_name
      FROM sets 
      JOIN exercises ON sets.exercise_id = exercises.id 
      WHERE workout_template_id = $1 AND is_template = 1`,
      [workout_template_id]
    );

    const isTemplate = true;

    const exerciseOrder = await GetExerciseOrder(
      workout_template_id,
      isTemplate
    );

    if (result.length === 0 || exerciseOrder === undefined) return [];

    const newMultisetsMap: Map<number, WorkoutSet[]> = new Map();

    for (let i = 0; i < result.length; i++) {
      const set: WorkoutSet = result[i];

      set.weight_unit = GetValidatedUnit(set.weight_unit, "weight");
      set.distance_unit = GetValidatedUnit(set.distance_unit, "distance");
      set.user_weight_unit = GetValidatedUnit(set.user_weight_unit, "weight");

      if (createSetsForWorkoutTemplate) {
        set.is_template = 1;
        set.workout_template_id = newWorkoutOrTemplateId;
      } else {
        set.is_template = 0;
        set.workout_id = newWorkoutOrTemplateId;
      }

      if (set.multiset_id > 0) {
        if (newMultisetsMap.has(set.multiset_id)) {
          newMultisetsMap.get(set.multiset_id)!.push(set);
        } else {
          newMultisetsMap.set(set.multiset_id, [set]);
        }

        continue;
      }

      const setId = await InsertSetIntoDatabase(set);

      if (setId === 0) continue;

      set.id = setId;
    }

    const newMultisetIdMap: Map<string, string> = new Map();

    for (const [id, setList] of newMultisetsMap) {
      const multiset = await GetMultisetWithId(id);

      if (multiset === undefined) continue;

      multiset.multiset_type = GetValidatedMultisetType(multiset.multiset_type);

      const setListIdList = GenerateMultisetSetListIdList(multiset.set_order);

      const newMultisetId = await InsertMultisetIntoDatabase(multiset);

      const newMultiset = { ...multiset, id: newMultisetId };

      for (let i = 0; i < setList.length; i++) {
        const set: WorkoutSet = setList[i];

        if (createSetsForWorkoutTemplate) {
          set.is_template = 1;
          set.workout_template_id = newWorkoutOrTemplateId;
        } else {
          set.is_template = 0;
          set.workout_id = newWorkoutOrTemplateId;
        }

        set.multiset_id = newMultisetId;

        const oldSetId = set.id;

        const newSetId = await InsertSetIntoDatabase(set);

        if (newSetId === 0) continue;

        set.id = newSetId;

        ReplaceNumberIn2DList(oldSetId, newSetId, setListIdList);
      }

      const newSetOrder = GenerateMultisetSetOrderString(setListIdList);

      newMultiset.set_order = newSetOrder;

      const success = await UpdateMultiset(newMultiset);

      if (!success) continue;

      newMultisetIdMap.set(`m${newMultisetId}`, `m${multiset.id}`);
    }

    let exerciseOrderString = exerciseOrder;

    if (newMultisetIdMap.size > 0) {
      const orderArray = exerciseOrder.split(",");

      for (const [newId, oldId] of newMultisetIdMap) {
        const index = orderArray.indexOf(oldId);
        if (index !== -1) {
          orderArray[index] = newId;
        }
      }

      exerciseOrderString = orderArray.join(",");
    }

    const { groupedSetList } = await CreateGroupedWorkoutSetList(
      result,
      exerciseOrderString,
      exerciseGroupDictionary
    );

    return groupedSetList;
  } catch (error) {
    console.log(error);
    return [];
  }
};
