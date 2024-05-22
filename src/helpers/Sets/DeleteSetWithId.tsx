import Database from "tauri-plugin-sql-api";

export const DeleteSetWithId = async (id: number) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute("DELETE from sets WHERE id = $1", [id]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
