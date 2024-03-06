import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../typings";

export default async function UpdateUserSettings({
  userSettings,
  db,
}: {
  userSettings: UserSettings;
  db: Database;
}) {
  try {
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
}
