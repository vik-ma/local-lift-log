import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../../typings";

export const CreateDefaultUserSettings = async () => {
  const show_timestamp_on_completed_set: boolean = true;
  const active_routine_id: number = 0;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      "INSERT into user_settings (show_timestamp_on_completed_set, active_routine_id) VALUES ($1, $2)",
      [show_timestamp_on_completed_set, active_routine_id]
    );

    const id: number = result.lastInsertId;

    const defaultUserSettings: UserSettings = {
      id: id,
      show_timestamp_on_completed_set: show_timestamp_on_completed_set,
      active_routine_id: active_routine_id,
    };

    return defaultUserSettings;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
