import Database from "tauri-plugin-sql-api";
import { UserSettingsOptional } from "../../typings";
import { IsNumberValidBinary } from "..";

export const UpdateShowTimestamp = async (
  userSettings: UserSettingsOptional
) => {
  if (
    userSettings.show_timestamp_on_completed_set === undefined ||
    !IsNumberValidBinary(userSettings.show_timestamp_on_completed_set)
  )
    return;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET show_timestamp_on_completed_set = $1 WHERE id = $2",
      [userSettings.show_timestamp_on_completed_set, userSettings.id]
    );
  } catch (error) {
    console.log(error);
  }
};
