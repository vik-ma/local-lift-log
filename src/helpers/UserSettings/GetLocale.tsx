import Database from "tauri-plugin-sql-api";
import { UserSettingsOptional } from "../../typings";

export const GetLocale = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<UserSettingsOptional[]>(
      "SELECT id, locale FROM user_settings"
    );

    const userSettings: UserSettingsOptional = result[0];

    return userSettings;
  } catch (error) {
    console.log(error);
  }
};