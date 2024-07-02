import Database from "tauri-plugin-sql-api";
import { Multiset } from "../../typings";

export const UpdateMultiset = async (multiset: Multiset): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE multisets SET 
        multiset_type = $1, set_order = $2, is_template = $3
        WHERE id = $4`,
      [
        multiset.multiset_type,
        multiset.set_order,
        multiset.is_template,
        multiset.id,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
