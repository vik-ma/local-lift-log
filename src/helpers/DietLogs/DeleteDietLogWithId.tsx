import Database from "@tauri-apps/plugin-sql";

export const DeleteDietLogWithId = async (dietLogId: number) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute("DELETE from diet_logs WHERE id = $1", [dietLogId]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
