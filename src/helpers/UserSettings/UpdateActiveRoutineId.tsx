import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../../typings";
import { IsNumberValidIdOr0 } from "..";

export const UpdateActiveRoutineId = async (userSettings: UserSettings) => {
  if (!IsNumberValidIdOr0(userSettings.active_routine_id)) return false;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET active_routine_id = $1 WHERE id = $2",
      [userSettings.active_routine_id, userSettings.id]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
