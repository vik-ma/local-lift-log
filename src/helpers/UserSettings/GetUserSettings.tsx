import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../../typings";

export const GetUserSettings = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: UserSettings[] = await db.select(
      "SELECT * FROM user_settings LIMIT 1"
    );

    if (result.length === 1) {
      const userSettings: UserSettings = result[0];
      return userSettings;
    } else {
      return undefined;
    }
  } catch (error) {
    console.log(error);
  }
};
