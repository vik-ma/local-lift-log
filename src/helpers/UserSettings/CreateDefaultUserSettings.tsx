import Database from "@tauri-apps/plugin-sql";
import { UserSettings } from "../../typings";
import { LocaleMap } from "..";

export const CreateDefaultUserSettings = async (
  useMetricUnits: boolean,
  locale: string,
  clockStyle: string
): Promise<UserSettings | undefined> => {
  const show_timestamp_on_completed_set = 1;
  const active_routine_id = 0;

  // TODO: DERIVE ALL STRING DEFAULT VALUES FROM CONSTANTS

  const default_unit_weight = useMetricUnits ? "kg" : "lbs";
  const default_unit_distance = useMetricUnits ? "km" : "mi";
  const default_unit_measurement = useMetricUnits ? "cm" : "in";

  const active_tracking_measurements = "";

  const default_time_input = "hhmmss";

  const default_locale = LocaleMap().has(locale) ? locale : "en-GB";

  const default_clock_style =
    clockStyle === "24h" || clockStyle === "12h" ? clockStyle : "24h";

  const default_time_input_behavior_hhmmss = "first";

  const default_time_input_behavior_mmss = "second";

  const default_increment_weight = 1;
  const default_increment_distance = 1;
  const default_increment_time = 60;
  const default_increment_resistance_level = 1;

  const save_calculation_string = 1;

  const show_calculation_buttons = 1;

  const default_increment_calculation_multiplier = 1;

  const default_calculation_tab = "plate";

  const shown_workout_properties = "template,routine,comment";

  const default_plate_collection_id = 1;

  const show_secondary_exercise_groups = 1;

  const automatically_update_active_measurements = 1;

  const default_num_new_sets = "3";

  const default_diet_log_day_is_yesterday = 0;

  const shown_time_period_properties = "ongoing,diet-phase,injury,note";

  const show_warmups_in_exercise_details = 1;
  const show_multisets_in_exercise_details = 1;
  const show_pace_in_exercise_details = 1;
  const show_set_comments_in_exercise_details = 1;
  const show_workout_comments_in_exercise_details = 1;

  const never_show_delete_modal = 0;

  const body_fat_calculation_settings = "male/20-29/14,15,17,18";

  const show_get_latest_body_weight_button = 1;

  const show_outdated_body_weight_message = 1;

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
        time_input_behavior_mmss, default_increment_weight, default_increment_distance, 
        default_increment_time, default_increment_resistance_level, 
        save_calculation_string, show_calculation_buttons, 
        default_increment_calculation_multiplier, default_calculation_tab, 
        shown_workout_properties, default_plate_collection_id,
        show_secondary_exercise_groups, automatically_update_active_measurements, 
        default_num_new_sets, shown_time_period_properties, default_diet_log_day_is_yesterday, 
        show_warmups_in_exercise_details, show_multisets_in_exercise_details,
        show_pace_in_exercise_details, show_set_comments_in_exercise_details,
        show_workout_comments_in_exercise_details, never_show_delete_modal, 
        body_fat_calculation_settings, show_get_latest_body_weight_button,
        show_outdated_body_weight_message) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, 
        $33, $34, $35)`,
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
        default_increment_weight,
        default_increment_distance,
        default_increment_time,
        default_increment_resistance_level,
        save_calculation_string,
        show_calculation_buttons,
        default_increment_calculation_multiplier,
        default_calculation_tab,
        shown_workout_properties,
        default_plate_collection_id,
        show_secondary_exercise_groups,
        automatically_update_active_measurements,
        default_num_new_sets,
        shown_time_period_properties,
        default_diet_log_day_is_yesterday,
        show_warmups_in_exercise_details,
        show_multisets_in_exercise_details,
        show_pace_in_exercise_details,
        show_set_comments_in_exercise_details,
        show_workout_comments_in_exercise_details,
        never_show_delete_modal,
        body_fat_calculation_settings,
        show_get_latest_body_weight_button,
        show_outdated_body_weight_message,
      ]
    );

    if (result.lastInsertId === undefined) return undefined;

    const defaultUserSettings: UserSettings = {
      id: result.lastInsertId,
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
      default_increment_weight,
      default_increment_distance,
      default_increment_time,
      default_increment_resistance_level,
      save_calculation_string,
      show_calculation_buttons,
      default_increment_calculation_multiplier,
      default_calculation_tab,
      shown_workout_properties,
      default_plate_collection_id,
      show_secondary_exercise_groups,
      automatically_update_active_measurements,
      default_num_new_sets,
      shown_time_period_properties,
      default_diet_log_day_is_yesterday,
      show_warmups_in_exercise_details,
      show_multisets_in_exercise_details,
      show_pace_in_exercise_details,
      show_set_comments_in_exercise_details,
      show_workout_comments_in_exercise_details,
      never_show_delete_modal,
      body_fat_calculation_settings,
      show_get_latest_body_weight_button,
      show_outdated_body_weight_message,
    };

    return defaultUserSettings;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
