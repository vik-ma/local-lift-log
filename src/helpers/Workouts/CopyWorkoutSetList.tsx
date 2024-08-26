import {
  GetMultisetWithId,
  InsertMultisetIntoDatabase,
  InsertSetIntoDatabase,
  ReplaceMultisetSetOrderStringIds,
  UpdateMultiset,
  UpdateSet,
} from "..";
import { UserSettings, WorkoutSet } from "../../typings";

type NewMultisetValues = {
  [key: number]: {
    idReplacementMap: Map<string, string>;
    setList: WorkoutSet[];
  };
};

export const CopyWorkoutSetList = async (
  setList: WorkoutSet[],
  newWorkoutId: number,
  keepSetValues: boolean,
  userSettings: UserSettings
) => {
  const newSetList = [...setList];

  const newMultisetValues: NewMultisetValues = {};

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

    const newSetId = await InsertSetIntoDatabase(set);

    if (newSetId === 0) continue;

    const oldSetId = set.id;

    set.id = newSetId;

    if (set.multiset_id !== 0) {
      if (newMultisetValues[set.multiset_id]) {
        // If a key with this multiset_id in newMultisetValues already exists
        const idReplacementMap =
          newMultisetValues[set.multiset_id].idReplacementMap;
        const setList = newMultisetValues[set.multiset_id].setList;

        idReplacementMap.set(oldSetId.toString(), newSetId.toString());
        setList.push(set);
      } else {
        // Create new entry in newMultisetValues and add this Set's new id
        const idReplacementMap: Map<string, string> = new Map();
        idReplacementMap.set(oldSetId.toString(), newSetId.toString());

        newMultisetValues[set.multiset_id] = {
          idReplacementMap: idReplacementMap,
          setList: [set],
        };
      }
    }
  }

  const newMultisetIdMap: Map<string, string> = new Map();

  for (const [oldMultisetId, newValues] of Object.entries(newMultisetValues)) {
    // Create new Multiset(s), if any should be created

    const multiset = await GetMultisetWithId(Number(oldMultisetId));

    if (multiset === undefined) continue;

    const newMultisetId = await InsertMultisetIntoDatabase(multiset);

    multiset.id = newMultisetId;

    // Replace the old Set ids in set_order with the new Set ids
    const newSetOrder = ReplaceMultisetSetOrderStringIds(
      multiset.set_order,
      newValues.idReplacementMap
    );

    multiset.set_order = newSetOrder;

    const success = await UpdateMultiset(multiset);

    if (!success) continue;

    newMultisetIdMap.set(`m${oldMultisetId}`, `m${newMultisetId}`);

    for (const set of newValues.setList) {
      // Update multiset_id column for copied sets
      set.multiset_id = newMultisetId;

      await UpdateSet(set);
    }
  }

  return { newSetList, newMultisetIdMap };
};
