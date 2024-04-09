import Database from "tauri-plugin-sql-api";
import { UserSettingsOptional } from "../../typings";
import { ValidMeasurementUnits } from "../Measurements/ValidMeasurementUnits";

export const UpdateDefaultUnitMeasurement = async (
  userSettings: UserSettingsOptional
) => {
  if (userSettings.default_unit_measurement === undefined) return;

  if (!ValidMeasurementUnits().includes(userSettings.default_unit_measurement))
    return;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET default_unit_measurement = $1 WHERE id = $2",
      [userSettings.default_unit_measurement, userSettings.id]
    );
  } catch (error) {
    console.log(error);
  }
};
