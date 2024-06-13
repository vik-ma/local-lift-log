import Database from "tauri-plugin-sql-api";

export const DeleteUserMeasurementById = async (
  userMeasurementId: number
): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute("DELETE from user_measurements WHERE id = $1", [userMeasurementId]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};