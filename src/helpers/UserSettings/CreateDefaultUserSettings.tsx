import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../../typings";

export const CreateDefaultUserSettings = async () => {
  const show_timestamp_on_completed_set: number = 1;
  const active_routine_id: number = 0;
  // TODO: CHANGE TO GET VALUE FROM PARAMETER (AFTER PROMPT)
  const default_unit_weight: string = "kg";
  const default_unit_distance: string = "km";

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into user_settings 
      (show_timestamp_on_completed_set, active_routine_id, default_unit_weight, default_unit_distance) 
      VALUES ($1, $2, $3, $4)`,
      [
        show_timestamp_on_completed_set,
        active_routine_id,
        default_unit_weight,
        default_unit_distance,
      ]
    );

    const id: number = result.lastInsertId;

    const defaultUserSettings: UserSettings = {
      id: id,
      show_timestamp_on_completed_set: show_timestamp_on_completed_set,
      active_routine_id: active_routine_id,
      default_unit_weight: default_unit_weight,
      default_unit_distance: default_unit_distance,
    };

    return defaultUserSettings;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
