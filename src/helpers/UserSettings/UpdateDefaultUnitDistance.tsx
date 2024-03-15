import Database from "tauri-plugin-sql-api";
import { UserSettingsOptional } from "../../typings";
import { ValidDistanceUnits } from "./ValidDistanceUnits";

export const UpdateDefaultUnitDistance = async (
  userSettings: UserSettingsOptional
) => {
  if (userSettings.default_unit_distance === undefined) return;

  if (!ValidDistanceUnits().includes(userSettings.default_unit_distance)) return;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET default_unit_distance = $1 WHERE id = $2",
      [userSettings.default_unit_distance, userSettings.id]
    );
  } catch (error) {
    console.log(error);
  }
};