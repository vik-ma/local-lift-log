import Database from "tauri-plugin-sql-api";
import { IsNumberValidId } from "../Numbers/IsNumberValidId";

export const UpdateDefaultPlateCollectionId = async (
  plateCollectionId: number,
  userSettingsId: number
) => {
  if (!IsNumberValidId(plateCollectionId)) return false;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET default_plate_collection_id = $1 WHERE id = $2",
      [plateCollectionId, userSettingsId]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
