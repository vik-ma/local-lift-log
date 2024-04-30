import Database from "tauri-plugin-sql-api";
import { UserSettingsOptional } from "../../typings";

export const UpdateDefaultTimeInput = async (
  userSettings: UserSettingsOptional
) => {
  if (userSettings.default_time_input === undefined) return;

  const validInputTypes: string[] = ["hhmmss", "mmss", "minutes", "seconds"];

  if (!validInputTypes.includes(userSettings.default_time_input)) return;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET default_time_input = $1 WHERE id = $2",
      [userSettings.default_time_input, userSettings.id]
    );
  } catch (error) {
    console.log(error);
  }
};
