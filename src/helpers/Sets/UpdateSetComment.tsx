import Database from "tauri-plugin-sql-api";

export const UpdateSetComment = async (
  comment: string | null,
  setId: number
): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(`UPDATE sets SET comment = $1 WHERE id = $2`, [comment, setId]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
