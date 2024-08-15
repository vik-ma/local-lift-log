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
      show_workout_rating = $12, default_increment_weight = $13, default_increment_weight = $14, 
      default_increment_weight = $15, default_increment_weight = $16 
      WHERE id = $17`,
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
        userSettings.show_workout_rating,
        userSettings.default_increment_weight,
        userSettings.default_increment_distance,
        userSettings.default_increment_time,
        userSettings.default_increment_resistance_level,
        userSettings.id,
      ]
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
