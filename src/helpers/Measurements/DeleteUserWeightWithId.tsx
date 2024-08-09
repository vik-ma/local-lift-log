import Database from "tauri-plugin-sql-api";

export const DeleteUserWeightWithId = async (
  userWeightId: number
): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute("DELETE from user_weights WHERE id = $1", [userWeightId]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
