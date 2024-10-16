import Database from "tauri-plugin-sql-api";
import { IsNumberValidId } from "../Numbers/IsNumberValidId";

export const UpdateDefaultPlateCalculationId = async (
  plateCalculationId: number,
  userSettingsId: number
) => {
  if (!IsNumberValidId(plateCalculationId)) return false;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET default_plate_calculation_id = $1 WHERE id = $2",
      [plateCalculationId, userSettingsId]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
