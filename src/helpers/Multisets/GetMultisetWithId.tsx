import Database from "tauri-plugin-sql-api";
import { Multiset } from "../../typings";
import { IsNumberValidId } from "..";

export const GetMultisetWithId = async (
  multisetId: number
): Promise<Multiset | undefined> => {
  if (!IsNumberValidId(multisetId)) return undefined;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<Multiset[]>(
      `SELECT * FROM multisets WHERE id = $1`,
      [multisetId]
    );

    const multiset = result[0];

    return multiset;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
