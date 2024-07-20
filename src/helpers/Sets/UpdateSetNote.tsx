import Database from "tauri-plugin-sql-api";

export const UpdateSetNote = async (
  note: string | null,
  setId: number
): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(`UPDATE sets SET note = $1 WHERE id = $2`, [note, setId]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
