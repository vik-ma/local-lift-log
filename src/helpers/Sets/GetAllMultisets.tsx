import Database from "tauri-plugin-sql-api";
import { Multiset, WorkoutSet } from "../../typings";
import { GenerateSetOrderList } from "./GenerateSetOrderList";
import { GetSetFromId } from "./GetSetFromId";

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

      for (let i = 0; i < setOrderList.length; i++) {
        const set = await GetSetFromId(setOrderList[i]);

        // TODO: UPDATE SET_ORDER IF UNDEFINED
        if (set === undefined) continue;

        setList.push(set);
      }

      multisets[i].setList = setList;
    }

    return multisets;
  } catch (error) {
    console.log(error);
    return [];
  }
};
