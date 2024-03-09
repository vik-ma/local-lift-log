import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../../typings";

export const UpdateUserSettings = async (userSettings: UserSettings) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET show_timestamp_on_completed_set = $1, active_routine_id = $2 WHERE id = $3",
      [
        userSettings.show_timestamp_on_completed_set,
        userSettings.active_routine_id,
        userSettings.id,
      ]
    );
  } catch (error) {
    console.log(error);
  }
};
