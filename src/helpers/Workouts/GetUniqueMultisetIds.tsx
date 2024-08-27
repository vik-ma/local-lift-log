import Database from "tauri-plugin-sql-api";

type DistinctMultisetIdQuery = {
  multiset_id: number;
};

export const GetUniqueMultisetIds = async (
  id: number,
  isTemplate: boolean
): Promise<number[]> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const queryString = isTemplate
      ? `SELECT DISTINCT multiset_id FROM sets
      WHERE workout_template_id = $1 
      AND is_template = 1 AND multiset_id != 0`
      : `SELECT DISTINCT multiset_id FROM sets
      WHERE workout_id = $1 AND multiset_id != 0`;

    const result = await db.select<DistinctMultisetIdQuery[]>(queryString, [
      id,
    ]);

    const multisetIds: number[] = result.map((multisetId) => {
      return multisetId.multiset_id;
    });

    return multisetIds;
  } catch (error) {
    console.log(error);
    return [];
  }
};
