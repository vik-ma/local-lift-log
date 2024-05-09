import { UserSettingsOptional } from "../../typings";
import { LocaleList } from "./LocaleList";
import Database from "tauri-plugin-sql-api";

export const UpdateLocale = async (userSettings: UserSettingsOptional) => {
  if (userSettings.locale === undefined) return;

  if (!LocaleList().some((locale) => locale.code === userSettings.locale))
    return;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);
    db.execute("UPDATE user_settings SET locale = $1 WHERE id = $2", [
      userSettings.locale,
      userSettings.id,
    ]);
  } catch (error) {
    console.log(error);
  }
};
