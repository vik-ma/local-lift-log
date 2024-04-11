import Database from "tauri-plugin-sql-api";

export const UpdateActiveTrackingMeasurements = async (
  activeTrackingMeasurementString: string,
  userSettingsId: number
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET active_tracking_measurements = $1 WHERE id = $2",
      [activeTrackingMeasurementString, userSettingsId]
    );
  } catch (error) {
    console.log(error);
  }
};
