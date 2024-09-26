import Database from "tauri-plugin-sql-api";
import { UserSettingsOptional } from "../../typings";
import { IsNumberValidId } from "..";

export const UpdateDefaultEquipmentWeightId = async (
  userSettings: UserSettingsOptional
) => {
  if (
    userSettings.default_equipment_weight_id === undefined ||
    !IsNumberValidId(userSettings.default_equipment_weight_id)
  )
    return;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET default_equipment_weight_id = $1 WHERE id = $2",
      [userSettings.default_equipment_weight_id, userSettings.id]
    );
  } catch (error) {
    console.log(error);
  }
};
