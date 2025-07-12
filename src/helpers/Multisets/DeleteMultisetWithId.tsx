import Database from "@tauri-apps/plugin-sql";

export const DeleteMultisetWithId = async (id: number) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute("DELETE from multisets WHERE id = $1", [id]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
