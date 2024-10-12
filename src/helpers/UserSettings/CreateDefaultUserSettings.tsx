import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../../typings";
import { LocaleList } from "..";

export const CreateDefaultUserSettings = async (
  useMetricUnits: boolean,
  locale: string,
  clockStyle: string
): Promise<UserSettings | undefined> => {
  const show_timestamp_on_completed_set = 1;
  const active_routine_id = 0;

  const default_unit_weight = useMetricUnits ? "kg" : "lbs";
  const default_unit_distance = useMetricUnits ? "km" : "mi";
  const default_unit_measurement = useMetricUnits ? "cm" : "in";

  const active_tracking_measurements = "";

  const default_time_input = "hhmmss";

  const default_locale = LocaleList().some((item) => item.code === locale)
    ? locale
    : "en-GB";

  const default_clock_style =
    clockStyle === "24h" || clockStyle === "12h" ? clockStyle : "24h";

  const default_time_input_behavior_hhmmss = "first";

  const default_time_input_behavior_mmss = "second";

  const default_show_workout_rating = 1;

  const default_increment_weight = 1;
  const default_increment_distance = 1;
  const default_increment_time = 60;
  const default_increment_resistance_level = 1;

  const save_calculation_string = 1;

  const default_equipment_weight_id = 1;

  const show_calculation_buttons = 1;

  const default_increment_calculation_multiplier = 1;

  const default_num_handles = 1;

  const default_calculation_tab = "plate";

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
        active_tracking_measurements, locale, clock_style, time_input_behavior_hhmmss, 
        time_input_behavior_mmss, show_workout_rating, default_increment_weight, 
        default_increment_distance, default_increment_time, default_increment_resistance_level,
        save_calculation_string, default_equipment_weight_id, show_calculation_buttons, 
        default_increment_calculation_multiplier, default_num_handles, default_calculation_tab) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 
        $17, $18, $19, $20, $21, $22)`,
      [
        show_timestamp_on_completed_set,
        active_routine_id,
        default_unit_weight,
        default_unit_distance,
        default_time_input,
        default_unit_measurement,
        active_tracking_measurements,
        default_locale,
        default_clock_style,
        default_time_input_behavior_hhmmss,
        default_time_input_behavior_mmss,
        default_show_workout_rating,
        default_increment_weight,
        default_increment_distance,
        default_increment_time,
        default_increment_resistance_level,
        save_calculation_string,
        default_equipment_weight_id,
        show_calculation_buttons,
        default_increment_calculation_multiplier,
        default_num_handles,
        default_calculation_tab,
      ]
    );

    const id: number = result.lastInsertId;

    const defaultUserSettings: UserSettings = {
      id: id,
      show_timestamp_on_completed_set,
      active_routine_id,
      default_unit_weight,
      default_unit_distance,
      default_time_input,
      default_unit_measurement,
      active_tracking_measurements,
      locale: default_locale,
      clock_style: default_clock_style,
      time_input_behavior_hhmmss: default_time_input_behavior_hhmmss,
      time_input_behavior_mmss: default_time_input_behavior_mmss,
      show_workout_rating: default_show_workout_rating,
      default_increment_weight,
      default_increment_distance,
      default_increment_time,
      default_increment_resistance_level,
      save_calculation_string,
      default_equipment_weight_id,
      show_calculation_buttons,
      default_increment_calculation_multiplier,
      default_num_handles,
      default_calculation_tab,
    };

    return defaultUserSettings;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
