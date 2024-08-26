import {
  GetMultisetWithId,
  InsertMultisetIntoDatabase,
  InsertSetIntoDatabase,
  ReplaceMultisetSetOrderStringIds,
  UpdateMultiset,
} from "..";
import { UserSettings, WorkoutSet } from "../../typings";

export const CopyWorkoutSetList = async (
  setList: WorkoutSet[],
  newWorkoutId: number,
  keepSetValues: boolean,
  userSettings: UserSettings
) => {
  const newSetList = [...setList];

  const multisetIdMap: Map<number, Map<string, string>> = new Map();

  for (const set of newSetList) {
    set.workout_id = newWorkoutId;
    set.comment = null;
    set.is_completed = 0;
    set.time_completed = null;

    if (!keepSetValues) {
      set.weight = 0;
      set.reps = 0;
      set.rir = -1;
      set.rpe = 0;
      set.time_in_seconds = 0;
      set.distance = 0;
      set.resistance_level = 0;
      set.partial_reps = 0;
      set.user_weight = 0;
    } else {
      set.weight_unit = userSettings.default_unit_weight;
      set.distance_unit = userSettings.default_unit_distance;
      set.user_weight_unit = userSettings.default_unit_weight;
    }

    const setId = await InsertSetIntoDatabase(set);

    if (setId === 0) continue;

    if (set.multiset_id !== 0) {
      if (multisetIdMap.has(set.multiset_id)) {
        // Add this Set's new id to existing multiset id entry's map
        const idReplacementMap = multisetIdMap.get(set.multiset_id);
        idReplacementMap!.set(set.id.toString(), setId.toString());
      } else {
        // Create new entry in multisetIdMap and add this Set's new id
        const idReplacementMap: Map<string, string> = new Map();
        idReplacementMap.set(set.id.toString(), setId.toString());

        multisetIdMap.set(set.multiset_id, idReplacementMap);
      }
    }

    set.id = setId;
  }

  for (const [multisetId, idReplacementMap] of multisetIdMap) {
    // Create new Multiset(s), if any should be created

    const multiset = await GetMultisetWithId(multisetId);

    if (multiset === undefined) continue;

    const newMultisetId = await InsertMultisetIntoDatabase(multiset);

    multiset.id = newMultisetId;

    // Replace the set_order with new Set id's
    const newSetOrder = ReplaceMultisetSetOrderStringIds(
      multiset.set_order,
      idReplacementMap
    );

    multiset.set_order = newSetOrder;

    await UpdateMultiset(multiset);
  }

  return newSetList;
};
