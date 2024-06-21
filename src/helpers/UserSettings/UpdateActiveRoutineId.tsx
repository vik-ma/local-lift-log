import Database from "tauri-plugin-sql-api";
import { UserSettingsOptional } from "../../typings";
import { IsNumberValidId } from "..";

export const UpdateActiveRoutineId = async (
  userSettings: UserSettingsOptional
) => {
  if (
    userSettings.active_routine_id === undefined ||
    !IsNumberValidId(userSettings.active_routine_id)
  )
    return;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET active_routine_id = $1 WHERE id = $2",
      [userSettings.active_routine_id, userSettings.id]
    );
  } catch (error) {
    console.log(error);
  }
};
