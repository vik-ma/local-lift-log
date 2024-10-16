import Database from "tauri-plugin-sql-api";
import {
  ValidateActiveMeasurementsString,
  IsNumberNegativeOrInfinity,
} from "..";

export const UpdateActiveTrackingMeasurements = async (
  activeTrackingMeasurementString: string,
  userSettingsId: number
) => {
  if (!ValidateActiveMeasurementsString(activeTrackingMeasurementString))
    return false;

  if (IsNumberNegativeOrInfinity(userSettingsId)) return false;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET active_tracking_measurements = $1 WHERE id = $2",
      [activeTrackingMeasurementString, userSettingsId]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
