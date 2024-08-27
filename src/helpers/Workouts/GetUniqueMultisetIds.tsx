import Database from "tauri-plugin-sql-api";

type DistinctMultisetIdQuery = {
  multiset_id: number;
};

export const GetUniqueMultisetIds = async (id: number): Promise<number[]> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<DistinctMultisetIdQuery[]>(
      `SELECT DISTINCT multiset_id FROM sets
      WHERE workout_id = $1 AND multiset_id != 0`,
      [id]
    );

    const multisetIds: number[] = result.map((multisetId) => {
      return multisetId.multiset_id;
    });

    return multisetIds;
  } catch (error) {
    console.log(error);
    return [];
  }
};
