import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../../typings";
import { LocaleList } from "./LocaleList";

export const CreateDefaultUserSettings = async (
  useMetricUnits: boolean,
  locale: string
): Promise<UserSettings | undefined> => {
  const show_timestamp_on_completed_set: number = 1;
  const active_routine_id: number = 0;

  const default_unit_weight: string = useMetricUnits ? "kg" : "lbs";
  const default_unit_distance: string = useMetricUnits ? "km" : "mi";
  const default_unit_measurement: string = useMetricUnits ? "cm" : "in";

  const default_time_input: string = "hhmmss";

  const default_locale: string = LocaleList().some(
    (item) => item.code === locale
  )
    ? locale
    : "en-GB";

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const rowsInUserSettings: UserSettings[] = await db.select(
      "SELECT * from user_settings"
    );

    // Ensure no other user_settings exist
    if (rowsInUserSettings.length > 0) return;

    const result = await db.execute(
      `INSERT into user_settings 
      (show_timestamp_on_completed_set, active_routine_id, default_unit_weight, 
        default_unit_distance, default_time_input, default_unit_measurement,
        active_tracking_measurements, locale) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        show_timestamp_on_completed_set,
        active_routine_id,
        default_unit_weight,
        default_unit_distance,
        default_time_input,
        default_unit_measurement,
        "",
        default_locale,
      ]
    );

    const id: number = result.lastInsertId;

    const defaultUserSettings: UserSettings = {
      id: id,
      show_timestamp_on_completed_set: show_timestamp_on_completed_set,
      active_routine_id: active_routine_id,
      default_unit_weight: default_unit_weight,
      default_unit_distance: default_unit_distance,
      default_time_input: default_time_input,
      default_unit_measurement: default_unit_measurement,
      active_tracking_measurements: "",
      locale: default_locale,
    };

    return defaultUserSettings;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
