import Database from "tauri-plugin-sql-api";
import { Multiset, WorkoutSet } from "../../typings";
import { GenerateSetOrderList } from "./GenerateSetOrderList";
import { GetSetFromId } from "./GetSetFromId";
import { UpdateMultiset } from "./UpdateMultiset";

export const GetAllMultisets = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const multisets = await db.select<Multiset[]>(`SELECT * FROM multisets`);

    for (let i = 0; i < multisets.length; i++) {
      const setOrderList = GenerateSetOrderList(multisets[i].set_order);

      if (setOrderList.length === 0) {
        multisets[i].setList = [];
        continue;
      }

      const setList: WorkoutSet[] = [];

      const setIdsToDelete: number[] = [];

      for (let i = 0; i < setOrderList.length; i++) {
        const set = await GetSetFromId(setOrderList[i]);

        if (set === undefined) {
          setIdsToDelete.push(setOrderList[i]);
          continue;
        }

        setList.push(set);
      }

      if (setIdsToDelete.length > 0) {
        // Remove set from current Multiset's set_order if a Set has been deleted
        const newSetList = setOrderList.filter(
          (item) => !setIdsToDelete.includes(item)
        );

        const newSetOrder = newSetList.join(",");

        multisets[i].set_order = newSetOrder;

        await UpdateMultiset(multisets[i]);
      }

      const setListString = setList
        .map((item) => item.exercise_name)
        .join(", ");

      multisets[i].setListString = setListString;
      multisets[i].setList = setList;
    }

    return multisets;
  } catch (error) {
    console.log(error);
    return [];
  }
};
