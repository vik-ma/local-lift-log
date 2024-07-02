import { Multiset } from "../../typings";
import Database from "tauri-plugin-sql-api";

export const InsertMultisetIntoDatabase = async (
  multiset: Multiset
): Promise<number> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into multisets 
        (multiset_type, set_order, is_template) 
        VALUES 
        ($1, $2, $3)`,
      [multiset.multiset_type, multiset.set_order, multiset.is_template]
    );
    return result.lastInsertId;
  } catch (error) {
    console.log(error);
    return 0;
  }
};
