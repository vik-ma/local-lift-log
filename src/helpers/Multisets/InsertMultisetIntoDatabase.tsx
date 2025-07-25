import { Multiset } from "../../typings";
import Database from "@tauri-apps/plugin-sql";

export const InsertMultisetIntoDatabase = async (
  multiset: Multiset
): Promise<number> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into multisets 
        (multiset_type, set_order, is_template, note) 
        VALUES 
        ($1, $2, $3, $4)`,
      [
        multiset.multiset_type,
        multiset.set_order,
        multiset.is_template,
        multiset.note,
      ]
    );

    if (result.lastInsertId === undefined) return 0;

    return result.lastInsertId;
  } catch (error) {
    console.log(error);
    return 0;
  }
};
