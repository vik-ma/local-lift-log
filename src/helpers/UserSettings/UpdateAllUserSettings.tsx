import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../../typings";
import { ValidateUserSettings } from "..";

export const UpdateAllUserSettings = async (
  userSettings: UserSettings
): Promise<boolean> => {
  if (!ValidateUserSettings(userSettings)) return false;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      `UPDATE user_settings 
      SET show_timestamp_on_completed_set = $1, active_routine_id = $2, 
      default_unit_weight = $3, default_unit_distance = $4, default_time_input = $5,
      default_unit_measurement = $6, active_tracking_measurements = $7, locale = $8,
      clock_style = $9, time_input_behavior_hhmmss = $10, time_input_behavior_mmss = $11,
      default_increment_weight = $12, default_increment_distance = $13, 
      default_increment_time = $14, default_increment_resistance_level = $15,
      save_calculation_string = $16, show_calculation_buttons = $17,
      default_increment_calculation_multiplier = $18, default_calculation_tab = $19,
      shown_workout_properties = $20, default_plate_collection_id = $21, 
      workout_ratings_order = $22, show_secondary_exercise_groups = $23, 
      automatically_update_active_measurements = $24, default_num_new_sets = $25, 
      shown_time_period_properties = $26, default_diet_log_day_is_yesterday = $27, 
      default_load_exercise_options = $28 
      WHERE id = $29`,
      [
        userSettings.show_timestamp_on_completed_set,
        userSettings.active_routine_id,
        userSettings.default_unit_weight,
        userSettings.default_unit_distance,
        userSettings.default_time_input,
        userSettings.default_unit_measurement,
        userSettings.active_tracking_measurements,
        userSettings.locale,
        userSettings.clock_style,
        userSettings.time_input_behavior_hhmmss,
        userSettings.time_input_behavior_mmss,
        userSettings.default_increment_weight,
        userSettings.default_increment_distance,
        userSettings.default_increment_time,
        userSettings.default_increment_resistance_level,
        userSettings.save_calculation_string,
        userSettings.show_calculation_buttons,
        userSettings.default_increment_calculation_multiplier,
        userSettings.default_calculation_tab,
        userSettings.shown_workout_properties,
        userSettings.default_plate_collection_id,
        userSettings.workout_ratings_order,
        userSettings.show_secondary_exercise_groups,
        userSettings.automatically_update_active_measurements,
        userSettings.default_num_new_sets,
        userSettings.shown_time_period_properties,
        userSettings.default_diet_log_day_is_yesterday,
        userSettings.default_load_exercise_options,
        userSettings.id,
      ]
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
