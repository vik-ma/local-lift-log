import Database from "tauri-plugin-sql-api";
import { UserSettingsOptional } from "../../typings";
import { ValidWeightUnits } from "./ValidWeightUnits";

export const UpdateDefaultUnitWeight = async (
  userSettings: UserSettingsOptional
) => {
  if (userSettings.default_unit_weight === undefined) return;

  if (!ValidWeightUnits().includes(userSettings.default_unit_weight)) return;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET default_unit_weight = $1 WHERE id = $2",
      [userSettings.default_unit_weight, userSettings.id]
    );
  } catch (error) {
    console.log(error);
  }
};
